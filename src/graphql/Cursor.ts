import Base64URL from 'base64-url';
import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql';

export function toCursor({ value }: {value: any}) {
	return Base64URL.encode(value.toString());
}

export function fromCursor(cursor: string) {
	const value = Base64URL.decode(cursor);
	if (value) {
		return { value };
	} else {
		return null;
	}
}

const CursorType = new GraphQLScalarType({
	name: 'Cursor',
	// Serializes an internal value to include in a response.
	serialize(value: any) {
		if(value.value) {
			return toCursor(value);
		} else {
			return null;
		}
	},
	// Parses an externally provided value to use as an input.
	parseValue(value) {
		return fromCursor(value);
	},
	// Parses an externally provided literal value to use as an input.
	parseLiteral(ast) {
		if(ast.kind === Kind.STRING) {
			return fromCursor(ast.value);
		} else {
			return null;
		}
	},
})

export default CursorType;