import { http } from "../../utils/http";
import { unwrap } from "../../utils/request";
import type {
  CreateProductPayload,
  Product,
  ProductListResult,
  ProductQuery,
  UpdateProductPayload,
} from "../../types/api";

export const productsApi = {
  list(query: ProductQuery): Promise<ProductListResult> {
    return unwrap(
      http.get("/products", {
        params: {
          search: query.search,
          category: query.category,
          minPrice: query.minPrice,
          maxPrice: query.maxPrice,
          page: query.page,
          limit: query.limit,
          lng: query.lng,
          lat: query.lat,
        },
      }),
    );
  },
  getById(id: string): Promise<Product> {
    return unwrap(http.get(`/products/${id}`));
  },
  listMine(): Promise<Product[]> {
    return unwrap(http.get("/products/mine"));
  },
  create(payload: CreateProductPayload): Promise<Product> {
    return unwrap(http.post("/products", payload));
  },
  update(id: string, payload: UpdateProductPayload): Promise<Product> {
    return unwrap(http.patch(`/products/${id}`, payload));
  },
  remove(id: string): Promise<null> {
    return unwrap(http.delete(`/products/${id}`));
  },
};
