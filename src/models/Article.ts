import {
  FindCursor, MongoClient, Document, ObjectId,
} from 'mongodb';

type PaginationParameters = {
	first?: number,
	last?: number,
	before?: number,
	after?: number,
}

export async function getArticles(mongodb: MongoClient, {
  first, last, before, after,
}: PaginationParameters) {
  const query = applyCursor(
    mongodb.db('relay-compliant').collection('Articles').find(),
    before,
    after,
  );
  const pageInfo = await applyPagination(query, first, last);

  return {
    query,
    pageInfo,
  };
}

function applyCursor(query: FindCursor<Document>, before: any, after: any) {
  const filter: Document = {
    _id: {},
  };
  if (before) {
    filter._id.$lt = new ObjectId(before.value);
  }
  if (after) {
    filter._id.$gt = new ObjectId(after.value);
  }

  return query.filter(filter);
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
