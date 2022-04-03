function isOfTypeFactory<T>(object: object): (value: any) => value is T {
	return function (value: any): value is T {
		return (Object.values(object) as string[]).includes(value);
	};
}

export default isOfTypeFactory;
