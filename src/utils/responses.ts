interface ISuccessResponse {
  status: "success";
  data: any;
  message?: string;
}
export const successResponse = (
  data: any,
  message?: string,
): ISuccessResponse => {
  return {
    status: "success",
    data,
    ...(message ? { message } : {}),
  };
};
