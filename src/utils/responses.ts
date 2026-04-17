interface ISuccessResponse {
  status: "success";
  data: any;
  message?: string;
  count?: number;
  nextCursor?: string | undefined;
}
interface IData {
  data: any;
  message?: string;
  count?: number;
  nextCursor?: string | undefined;
}
export const successResponse = (data: IData): ISuccessResponse => {
  const response: ISuccessResponse = {
    status: "success",
    data: data.data,
  };

  if (data.message !== undefined) {
    response.message = data.message;
  }

  if (data.count !== undefined) {
    response.count = data.count;
  }

  if (data.nextCursor !== undefined) {
    response.nextCursor = data.nextCursor;
  }

  return response;
};
