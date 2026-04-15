interface ISuccessResponse {
  status: "success";
  data: any;
  message?: string;
  count?: number;
}
interface IData {
  data: any;
  message?: string;
  count?: number;
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

  return response;
};
