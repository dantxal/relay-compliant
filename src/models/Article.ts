import { FindCursor, MongoClient, Document } from "mongodb";

type PaginationParameters = {
	first?: number
	last?: number
}

export async function getArticles(mongodb: MongoClient, { first, last }: PaginationParameters) {
	const query = mongodb.db('relay-compliant').collection('Articles').find();
	const pageInfo = await applyPagination(query, first, last);

	return {
		query,
		pageInfo
	}
}

async function applyPagination(query: FindCursor<Document>, first?: number, last?: number) {
	let count;

	if (first || last) {
		count = await query.clone().count();
		let limit = 0;
		let skip = 0;

		if(first && count > first) {
			limit = first;
		}

		if(last) {
			if(limit && limit > last) {
				skip = limit - last;
				limit = limit - skip;
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

		return {
			hasNextPage: Boolean(first && count > first),
			hasPreviousPage: Boolean(last && count > last),
		}
	}
}