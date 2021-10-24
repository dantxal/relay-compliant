import {
  FindCursor, MongoClient, Document, ObjectId, Collection,
} from 'mongodb';

type PaginationParameters = {
	first?: number,
	last?: number,
	before?: number,
	after?: number,
	orderField?: string
	order?: 1 | -1
}

export async function getArticles(
  mongodb: MongoClient,
  {
    first, last, before, after, orderField, order,
  }: PaginationParameters,

) {
  const collection = mongodb.db('relay-compliant').collection('Articles');
  let query;

  if (orderField === 'id' && order) {
    query = applyCursorAndOrderById(collection, order, before, after);
  } else if (orderField && order) {
    query = await applyCursorAndOrder(collection, orderField, order, before, after);
  } else {
    query = applyCursor(collection, before, after);
  }

  const pageInfo = await applyPagination(query, first, last);

  return {
    query,
    pageInfo,
  };
}

function applyCursorAndOrderById(
  collection: Collection<Document>,
  order: 1 | -1,
  before?: any,
  after?: any,
) {
  const query = collection.find();
  const filter: Document = {
    _id: {},
  };

  if (!before && !after) {
    return query.sort('_id', order);
  }

  if (before) {
    const op = order === 1 ? '$lt' : '$gt';
    filter._id[op] = new ObjectId(before.value);
  }
  if (after) {
    const op = order === -1 ? '$lt' : '$gt';
    filter._id[op] = new ObjectId(after.value);
  }

  return query.filter(filter);
}

async function applyCursorAndOrder(
  collection: Collection<Document>,
  field: string,
  order: 1|-1,
  before?: any,
  after?: any,
) {
  let filter = {};
  const limits: any = {};
  const ors = [];

  if (before) {
    const op = order === 1 ? '$lt' : '$gt';
    const beforeObject = await collection.findOne({
      _id: new ObjectId(before.value),
    }, {
      fieldsAsRaw: {
        [field]: 1,
      },
    });

    if (beforeObject) {
      limits[op] = beforeObject[field];
      ors.push({
        [field]: beforeObject[field],
        _id: { [op]: new ObjectId(before.value) },
      });
    }
  }
  if (after) {
    const op = order === -1 ? '$lt' : '$gt';
    const afterObject = await collection.findOne({
      _id: new ObjectId(after.value),
    }, {
      fieldsAsRaw: {
        [field]: 1,
      },
    });
    if (afterObject) {
      limits[op] = afterObject[field];
      ors.push({
        [field]: afterObject[field],
        _id: { [op]: new ObjectId(after.value) },
      });
    }
  }
  if (before || after) {
    filter = {
      $or: [
        {
          [field]: limits,
        },
        ...ors,
      ],
    };
  }

  return collection.find(filter).sort([[field, order], ['_id', order]]);
}

function applyCursor(collection: Collection<Document>, before: any, after: any) {
  const filter: Document = {
    _id: {},
  };

  if (!before && !after) {
    return collection.find();
  }
  if (before) {
    filter._id.$lt = new ObjectId(before.value);
  }
  if (after) {
    filter._id.$gt = new ObjectId(after.value);
  }

  return collection.find().filter(filter);
}

async function applyPagination(query: FindCursor<Document>, first?: number, last?: number) {
  let count = 0;

  if (first || last) {
    count = await query.clone().count();
    let limit = 0;
    let skip = 0;

    if (first && count > first) {
      limit = first;
    }

    if (last) {
      if (limit && limit > last) {
        skip = limit - last;
        limit -= skip;
      } else if (!limit && count > last) {
        skip = count - last;
      }
    }

    if (skip) {
      query.skip(skip);
    }

    if (limit) {
      query.limit(limit);
    }
  }

  return {
    hasNextPage: Boolean(first && count > first),
    hasPreviousPage: Boolean(last && count > last),
  };
}
