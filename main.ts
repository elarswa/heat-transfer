import { ThermalGraph } from "./classes.ts";
import {
	cmp_ambientAir,
	cmp_fluidContactingPanel,
	cmp_fluidInHeatExchanger,
	cmp_fluidInPipe,
	cmp_fluidInReturnPipe,
	cmp_fluidInStorage,
	cmp_heatExchanger,
	cmp_pipe,
	cmp_returnPipe,
	cmp_solarPanel,
	cmp_storageTank,
} from "./components.ts";
import { allEdges } from "./edges.ts";

const graph = new ThermalGraph();

graph.systemNodes = Array.from(
	new Set([
		cmp_fluidContactingPanel,
		cmp_fluidInHeatExchanger,
		cmp_fluidInPipe,
		cmp_fluidInReturnPipe,
		cmp_fluidInStorage,
		cmp_heatExchanger,
		cmp_pipe,
		cmp_returnPipe,
		cmp_solarPanel,
		cmp_storageTank,
		cmp_ambientAir,
	]),
);

graph.logNodes = Array.from(
	new Set([
		cmp_fluidContactingPanel,
		cmp_fluidInHeatExchanger,
		cmp_fluidInPipe,
		cmp_fluidInReturnPipe,
		cmp_fluidInStorage,
		cmp_heatExchanger,
		// cmp_pipe,
		// cmp_returnPipe,
		cmp_solarPanel,
		// cmp_storageTank,
		// cmp_ambientAir,
	]),
);

// add an edge for every transfer in the system
graph.edges = allEdges;

const simulationTimeSeconds = 3600 * 4; // 4 hours
const simulationStepSeconds = 1;

for (let t = 0; t < simulationTimeSeconds; t += simulationStepSeconds) {
	// simulate every minute
	graph.simulateStep(simulationStepSeconds, t);
}
graph.writeNodeLogsToCSV();
