import { createBulkOps } from '../utils/bulkOps';

describe('createBulkOps', () => {
  it('should create bulk operations for the given model', () => {
    const model = [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' },
    ];

    const expectedBulkOps = [
      {
        updateOne: {
          filter: { id: 1 },
          update: { $set: { id: 1, name: 'Item 1' } },
          upsert: true,
        },
      },
      {
        updateOne: {
          filter: { id: 2 },
          update: { $set: { id: 2, name: 'Item 2' } },
          upsert: true,
        },
      },
    ];

    const bulkOps = createBulkOps(model);
    expect(bulkOps).toEqual(expectedBulkOps);
  });

  it('should return an empty array if the model is empty', () => {
    const model: any[] = [];
    const bulkOps = createBulkOps(model);
    expect(bulkOps).toEqual([]);
  });
});
