export const sendResponse = (res, statusCode, message, data) => {
    const payload = {
        success: true,
        message,
        data
    };
    res.status(statusCode).json(payload);
};
