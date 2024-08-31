export const createBulkOps = (model: any): any => {
  const bulkOps = model.map((item: any) => ({
    updateOne: {
      filter: { id: item.id },
      update: { $set: item },
      upsert: true,
    },
  }));
  return bulkOps;
};
