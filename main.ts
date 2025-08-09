import {
	HeatTransferEdge,
	type Material,
	ThermalComponent,
	ThermalGraph,
} from "./classes.ts";
import {
	SolarAbsorbtionStrategy,
	ConductionStrategy,
	ConvectionStrategy,
} from "./heatTransferStrategy.ts";

const AMBIENT_TEMPERATURE_KELVIN = 293.15; // [K]

const waterToWaterHeatTransferCoefficient = 340; // [W/m²·K]
const pipeLength = 10; // [m]
const pipeSurfaceArea = 0.1; // [m²]
const solarPanelSurfaceArea = 4.0; // [m²]

// https://thermtest.com/thermal-resources/materials-database
// emissivity https://www.engineeringtoolbox.com/emissivity-coefficients-d_447.html
// absorptivity https://www.engineeringtoolbox.com/solar-radiation-absorbed-materials-d_1568.html

const m_copper: Material = {
	name: "Copper",
	thermalConductivity: 397.48, // [W/m·K]
	specificHeat: 385, // [J/kg·K]
	emissivity: 0.03, // [0-1] for radiation calculations
	absorptivity: 0.64,
	density: 8940, // [kg/m³]
};

const m_water: Material = {
	name: "Water",
	thermalConductivity: 0.60652, // [W/m·K]
	specificHeat: 4181, // [J/kg·K]
	emissivity: 0.95, // [0-1] for radiation calculations
	density: 997.05, // [kg/m³]
};

const m_air: Material = {
	name: "Air",
	thermalConductivity: 0.025, // [W/m·K]
	specificHeat: 1004, // [J/kg·K]
	density: 1.29, // [kg/m³]
};

const steel: Material = {
	name: "Steel 304",
	thermalConductivity: 14.644, // [W/m·K]
	specificHeat: 502, // [J/kg·K]
	emissivity: 0.85, // weathered
	absorptivity: 0.85, // weathered
	density: 7920, // [kg/m³]
};

// TODO: refactor, move materials to separate file
// TODO: refactor, move components to separate file
// TODO: refactor, move edges to separate file

// dummy component, do not add to graph, just create edge
const cmp_solarRadiation: ThermalComponent = {
	id: "sun",
	material: {} as Material,
	temperature: 5800,
	getHeatCapacity: () => 0,
	log: [],
	volume: 0,
	setTemperature: (temp: number) => {},
	logAsCelcius: true,
};

const cmp_solarPanel = new ThermalComponent(
	"solar panel",
	m_copper,
	1.0,
	AMBIENT_TEMPERATURE_KELVIN,
);

const cmp_fluidContactingPanel = new ThermalComponent(
	"fluid contacting panel",
	m_water,
	0.1, // volume in contact with the fluid
	AMBIENT_TEMPERATURE_KELVIN,
);

const cmp_fluidInPipe = new ThermalComponent(
	"fluid in pipe",
	m_water,
	1.0,
	AMBIENT_TEMPERATURE_KELVIN,
);

const ambientAir = new ThermalComponent(
	"air",
	m_air,
	99999999999,
	AMBIENT_TEMPERATURE_KELVIN,
);
const cmp_pipe = new ThermalComponent(
	"pipe",
	steel,
	1.0,
	AMBIENT_TEMPERATURE_KELVIN,
);
const cmp_storageTank = new ThermalComponent(
	"storage tank",
	steel,
	1.0,
	AMBIENT_TEMPERATURE_KELVIN,
);

const cmp_heatExchanger = new ThermalComponent(
	"heat exchanger",
	m_copper,
	1.0,
	AMBIENT_TEMPERATURE_KELVIN,
);

const cmp = new ThermalComponent(
	"fluid in heat exchanger",
	m_water,
	5.0,
	AMBIENT_TEMPERATURE_KELVIN,
);

const cmp_fluidInStorage = new ThermalComponent(
	"fluid in storage",
	m_water,
	5.0,
	AMBIENT_TEMPERATURE_KELVIN,
);

const e_solarRadiation = new HeatTransferEdge(
	cmp_solarRadiation,
	cmp_solarPanel,
	new SolarAbsorbtionStrategy(1000, solarPanelSurfaceArea), // 1000 W/m² solar radiation, 1.0 m² surface area
);

const e_panelToFluid = new HeatTransferEdge(
	cmp_solarPanel,
	cmp_fluidContactingPanel,
	new ConductionStrategy(1, pipeSurfaceArea),
);

const e_fluidToPipe = new HeatTransferEdge(
	cmp_fluidInPipe,
	cmp_pipe,
	new ConductionStrategy(pipeLength, pipeSurfaceArea),
);

const e_fluidToFluidInPipe = new HeatTransferEdge(
	cmp_fluidContactingPanel,
	cmp_fluidInPipe,
	new ConvectionStrategy(1, waterToWaterHeatTransferCoefficient),
);

const e_pipeToAir = new HeatTransferEdge(
	cmp_pipe,
	ambientAir,
	new ConductionStrategy(pipeLength, pipeSurfaceArea), // TODO: probably wrong value inputs
);

const e_panelToAir = new HeatTransferEdge(
	cmp_solarPanel,
	ambientAir,
	new ConductionStrategy(1.0, solarPanelSurfaceArea),
);

// TODO model copper pipe heat exchanger into water storage tank

const graph = new ThermalGraph();

// only add nodes which need to be logged
graph.nodes = [
	cmp_solarPanel,
	cmp_fluidContactingPanel,
	cmp_fluidInPipe,
	cmp_pipe,
	cpm_fluidInHeatExchanger,
	cmp_heatExchanger,
	cmp_fluidInStorage,
	cmp_storageTank,
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
