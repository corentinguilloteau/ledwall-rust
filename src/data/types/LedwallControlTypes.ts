import isOfTypeFactory from "./utils";

enum LedwallControlStatusEnum {
	Displaying = "display",
	// Testing = "test",
	Stopped = "stop",
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
	status: "display";
}

interface StoppedLedwallControlHolder extends CommonLedwallControlHolder {
	status: "stop";
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
