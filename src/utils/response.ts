const formatResponse = (statusCode: number, message: string, data: any) => {
  return {
    statusCode,
    body: {
      message,
      data,
    },
  };
};

export const successResponse = (data: any) => {
  return formatResponse(200, 'success', data);
};
