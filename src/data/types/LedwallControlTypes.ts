import isOfTypeFactory from "./utils";

enum LedwallControlStatusEnum {
	Displaying = "displaying",
	// Testing = "test",
	Stopped = "stopped",
}

enum LedwallControlTestsEnum {
	Number = "number",
	Version = "version",
	// Color = "color",
}

type LedwallControlStatus = `${LedwallControlStatusEnum}`;
type LedwallControlTests = `${LedwallControlTestsEnum}`;

interface CommonLedwallControlHolder {
	status: LedwallControlStatus;
}

interface DisplayingLedwallControlHolder extends CommonLedwallControlHolder {
	status: "displaying";
}

interface StoppedLedwallControlHolder extends CommonLedwallControlHolder {
	status: "stopped";
}

// interface TestingLedwallControlHolder extends CommonLedwallControlHolder {
// 	status: LedwallControlStatus.Testing;
// 	test: LedwallControlTests;
// }

type LedwallControlHolder =
	| DisplayingLedwallControlHolder
	| StoppedLedwallControlHolder /*| TestingLedwallControlHolder*/;

let isTestType = isOfTypeFactory<LedwallControlTests>(LedwallControlTestsEnum);

export {
	type LedwallControlHolder,
	type LedwallControlStatus,
	type LedwallControlTests,
	LedwallControlTestsEnum,
	isTestType,
};
