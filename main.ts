import { ThermalGraph } from "./classes.ts";
import {
	cmp_fluidContactingPanel,
	cmp_fluidInPipe,
	cmp_fluidInStorage,
	cmp_heatExchanger,
	cmp_pipe,
	cmp_returnPipe,
	cmp_solarPanel,
	cmp_storageTank,
	cmp_fluidInHeatExchanger,
} from "./components.ts";
import { allEdges } from "./edges.ts";

const graph = new ThermalGraph();

//  add nodes which need to be logged
graph.nodes = Array.from(
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
	]),
);

// add an edge for every transfer in the system
graph.edges = allEdges;

const simulationTimeSeconds = 3600 * 4; // 4 hours
const simulationStepSeconds = 60 * 10; // 10 minutes

// todo const flowRate = (waterInPipe.volume + waterContactingPanel.volume ) /
// TODO: const simulationStepSecondsBasedOnFlowRate = pipeLength * pipecrossSectionArea;

for (let t = 0; t < simulationTimeSeconds; t += simulationStepSeconds) {
	// simulate every minute
	graph.simulateStep(simulationStepSeconds, t);
}
graph.writeNodeLogsToCSV();
