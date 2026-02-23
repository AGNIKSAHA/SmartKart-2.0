import {
  Schema,
  model,
  type FilterQuery,
  type Types,
  type PipelineStage,
} from "mongoose";
import type { ProductEntity } from "../../common/types/domain.types.js";

interface ProductDb {
  _id: Types.ObjectId;
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  stock: number;
  category: string;
  storeName: string;
  shopkeeperId?: string;
  location?: {
    type: "Point";
    coordinates: [number, number];
  };
}

interface ProductWithShopkeeper {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  stock: number;
  category: string;
  storeName: string;
  shopkeeperId?: string;
}

export interface ProductQueryInput {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  page: number;
  limit: number;
  lng?: number;
  lat?: number;
}

interface ProductListResult {
  items: ProductEntity[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const productSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0 },
    category: { type: String, required: true },
    storeName: { type: String, required: true },
    shopkeeperId: { type: String, required: false, index: true },
    location: {
      type: { type: String, enum: ["Point"] },
      coordinates: { type: [Number] },
    },
  },
  {
    timestamps: false,
  },
);

productSchema.index({ location: "2dsphere" });

const ProductModel = model<ProductDb>("Product", productSchema);

const toEntity = (doc: ProductDb): ProductEntity => ({
  id: doc._id.toString(),
  title: doc.title,
  description: doc.description,
  imageUrl: doc.imageUrl,
  price: doc.price,
  stock: doc.stock,
  category: doc.category,
  storeName: doc.storeName,
  ...(doc.location ? { location: doc.location } : {}),
});

const toEntityWithShopkeeper = (doc: ProductDb): ProductWithShopkeeper => ({
  id: doc._id.toString(),
  title: doc.title,
  description: doc.description,
  imageUrl: doc.imageUrl,
  price: doc.price,
  stock: doc.stock,
  category: doc.category,
  storeName: doc.storeName,
  ...(doc.shopkeeperId ? { shopkeeperId: doc.shopkeeperId } : {}),
});

const seedProducts: Omit<ProductEntity, "id">[] = [
  {
    title: "Premium Hoodie",
    description: "Heavyweight cotton hoodie for daily wear.",
    imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
    price: 69,
    stock: 30,
    category: "fashion",
    storeName: "Admin Store",
  },
  {
    title: "Wireless Keyboard",
    description: "Mechanical feel keyboard with low-latency pairing.",
    imageUrl: "https://images.unsplash.com/photo-1517336714739-489689fd1ca8",
    price: 119,
    stock: 20,
    category: "electronics",
    storeName: "Admin Store",
  },
  {
    title: "Running Shoes",
    description: "Cushioned sole designed for long sessions.",
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
    price: 89,
    stock: 45,
    category: "sports",
    storeName: "Admin Store",
  },
];

export const productStore = {
  async ensureSeed(): Promise<void> {
    const count = await ProductModel.countDocuments().exec();
    if (count === 0) {
      await ProductModel.insertMany(seedProducts);
    }
  },

  async list(input: ProductQueryInput): Promise<ProductListResult> {
    const filter: FilterQuery<ProductDb> = {};

    if (input.search) {
      filter.$or = [
        { title: { $regex: input.search, $options: "i" } },
        { description: { $regex: input.search, $options: "i" } },
      ];
    }

    if (input.category) {
      filter.category = input.category;
    }

    if (input.minPrice !== undefined || input.maxPrice !== undefined) {
      filter.price = {
        ...(input.minPrice !== undefined ? { $gte: input.minPrice } : {}),
        ...(input.maxPrice !== undefined ? { $lte: input.maxPrice } : {}),
      };
    }

    const skip = (input.page - 1) * input.limit;

    if (input.lng !== undefined && input.lat !== undefined) {
      // Geo-spatial search using aggregation
      const pipeline: PipelineStage[] = [
        {
          $geoNear: {
            near: { type: "Point", coordinates: [input.lng, input.lat] },
            distanceField: "distanceMeters",
            query: filter,
            spherical: true,
          },
        },
        { $sort: { distanceMeters: 1 } },
        {
          $facet: {
            metadata: [{ $count: "total" }],
            data: [{ $skip: skip }, { $limit: input.limit }],
          },
        },
      ];

      const results = await ProductModel.aggregate(pipeline).exec();
      const facetResult = results[0] || { data: [], metadata: [] };
      const items = facetResult.data || [];
      const total = facetResult.metadata?.[0]?.total ?? 0;
      const totalPages = Math.max(1, Math.ceil(total / input.limit));

      return {
        items: items.map((item: ProductDb & { distanceMeters: number }) => ({
          ...toEntity(item),
          distanceKm: item.distanceMeters / 1000,
        })),
        pagination: {
          page: input.page,
          limit: input.limit,
          total,
          totalPages,
        },
      };
    }

    const [items, total] = await Promise.all([
      ProductModel.find(filter)
        .sort({ _id: -1 })
        .skip(skip)
        .limit(input.limit)
        .lean<ProductDb[]>()
        .exec(),
      ProductModel.countDocuments(filter).exec(),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / input.limit));

    return {
      items: items.map(toEntity),
      pagination: {
        page: input.page,
        limit: input.limit,
        total,
        totalPages,
      },
    };
  },

  async findById(id: string): Promise<ProductEntity | undefined> {
    const product = await ProductModel.findById(id).lean<ProductDb>().exec();
    return product ? toEntity(product) : undefined;
  },

  async findByIdWithShopkeeper(
    id: string,
  ): Promise<ProductWithShopkeeper | undefined> {
    const product = await ProductModel.findById(id).lean<ProductDb>().exec();
    return product ? toEntityWithShopkeeper(product) : undefined;
  },

  async listByShopkeeperId(shopkeeperId: string): Promise<ProductEntity[]> {
    const items = await ProductModel.find({ shopkeeperId })
      .sort({ _id: -1 })
      .lean<ProductDb[]>()
      .exec();
    return items.map(toEntity);
  },

  async create(
    input: Omit<ProductEntity, "id"> & { shopkeeperId: string },
  ): Promise<ProductEntity> {
    const product = await ProductModel.create(input);
    return toEntity(product.toObject());
  },

  async updateByShopkeeper(
    id: string,
    shopkeeperId: string,
    input: Partial<Omit<ProductEntity, "id">>,
  ): Promise<ProductEntity | undefined> {
    const product = await ProductModel.findOneAndUpdate(
      { _id: id, shopkeeperId },
      input,
      { new: true },
    )
      .lean<ProductDb>()
      .exec();
    return product ? toEntity(product) : undefined;
  },

  async removeByShopkeeper(id: string, shopkeeperId: string): Promise<boolean> {
    const deleted = await ProductModel.findOneAndDelete({
      _id: id,
      shopkeeperId,
    }).exec();
    return Boolean(deleted);
  },

  /**
   * Atomically decrement stock for each item after a successful payment.
   * Returns false if any product has insufficient stock.
   */
  async decrementStock(
    items: Array<{ productId: string; quantity: number }>,
  ): Promise<boolean> {
    for (const item of items) {
      const result = await ProductModel.findOneAndUpdate(
        { _id: item.productId, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true },
      ).exec();

      if (!result) {
        return false;
      }
    }
    return true;
  },

  /**
   * Restore stock for each item when an order is cancelled/refunded.
   */
  async restoreStock(
    items: Array<{ productId: string; quantity: number }>,
  ): Promise<void> {
    await Promise.all(
      items.map((item) =>
        ProductModel.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.quantity },
        }).exec(),
      ),
    );
  },
};
