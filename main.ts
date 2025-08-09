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
import {
	e_fluidToFluidInPipe,
	e_fluidToPipe,
	e_panelToAir,
	e_panelToFluid,
	e_pipeToAir,
	e_solarRadiation,
} from "./edges.ts";

const graph = new ThermalGraph();

// only add nodes which need to be logged
graph.nodes = [
	cmp_solarPanel,
	cmp_fluidContactingPanel,
	cmp_fluidInPipe,
	cmp_pipe,
	cmp_fluidInHeatExchanger,
	cmp_heatExchanger,
	cmp_fluidInStorage,
	cmp_storageTank,
	cmp_returnPipe,
];

// add an edge for every transfer in the system
graph.edges = [
	e_solarRadiation,
	e_panelToAir,
	e_panelToFluid,
	e_fluidToPipe,
	e_pipeToAir,
	e_fluidToFluidInPipe,
];

const simulationTimeSeconds = 3600 * 4; // 4 hours
const simulationStepSeconds = 60 * 10; // 10 minutes

// todo const flowRate = (waterInPipe.volume + waterContactingPanel.volume ) /
// TODO: const simulationStepSecondsBasedOnFlowRate = pipeLength * pipecrossSectionArea;

for (let t = 0; t < simulationTimeSeconds; t += simulationStepSeconds) {
	// simulate every minute
	graph.simulateStep(simulationStepSeconds, t);
}
graph.writeNodeLogsToCSV();
