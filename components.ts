import { type Material, ThermalComponent } from "./classes";

const AMBIENT_TEMPERATURE_KELVIN = 293.15; // [K]

// https://thermtest.com/thermal-resources/materials-database
// emissivity https://www.engineeringtoolbox.com/emissivity-coefficients-d_447.html
// absorptivity https://www.engineeringtoolbox.com/solar-radiation-absorbed-materials-d_1568.html

export const m_copper: Material = {
	name: "Copper",
	thermalConductivity: 397.48, // [W/m·K]
	specificHeat: 385, // [J/kg·K]
	emissivity: 0.03, // [0-1] for radiation calculations
	absorptivity: 0.64,
	density: 8940, // [kg/m³]
};

export const m_water: Material = {
	name: "Water",
	thermalConductivity: 0.60652, // [W/m·K]
	specificHeat: 4181, // [J/kg·K]
	emissivity: 0.95, // [0-1] for radiation calculations
	density: 997.05, // [kg/m³]
};

export const m_air: Material = {
	name: "Air",
	thermalConductivity: 0.025, // [W/m·K]
	specificHeat: 1004, // [J/kg·K]
	density: 1.29, // [kg/m³]
};

export const steel: Material = {
	name: "Steel 304",
	thermalConductivity: 14.644, // [W/m·K]
	specificHeat: 502, // [J/kg·K]
	emissivity: 0.85, // weathered
	absorptivity: 0.85, // weathered
	density: 7920, // [kg/m³]
};

// dummy component, do not add to graph, just create edge
export const cmp_solarRadiation: ThermalComponent = {
	id: "sun",
	material: {} as Material,
	temperature: 5800,
	getHeatCapacity: () => 0,
	log: [],
	volume: 0,
	setTemperature: (temp: number) => {},
	logAsCelcius: true,
};

export const cmp_solarPanel = new ThermalComponent(
	"solar panel",
	m_copper,
	1.0,
	AMBIENT_TEMPERATURE_KELVIN,
);

export const cmp_fluidContactingPanel = new ThermalComponent(
	"fluid contacting panel",
	m_water,
	0.1, // volume in contact with the fluid
	AMBIENT_TEMPERATURE_KELVIN,
);

export const cmp_fluidInPipe = new ThermalComponent(
	"fluid in pipe",
	m_water,
	1.0,
	AMBIENT_TEMPERATURE_KELVIN,
);

export const cmp_ambientAir = new ThermalComponent(
	"air",
	m_air,
	99999999999,
	AMBIENT_TEMPERATURE_KELVIN,
);

export const cmp_pipe = new ThermalComponent(
	"pipe",
	steel,
	1.0,
	AMBIENT_TEMPERATURE_KELVIN,
);

export const cmp_storageTank = new ThermalComponent(
	"storage tank",
	steel,
	1.0,
	AMBIENT_TEMPERATURE_KELVIN,
);

export const cmp_heatExchanger = new ThermalComponent(
	"heat exchanger",
	m_copper,
	1.0,
	AMBIENT_TEMPERATURE_KELVIN,
);

export const cmp_fluidInHeatExchanger = new ThermalComponent(
	"fluid in heat exchanger",
	m_water,
	1.0,
	AMBIENT_TEMPERATURE_KELVIN,
);

export const cmp_fluidInStorage = new ThermalComponent(
	"fluid in storage",
	m_water,
	5.0,
	AMBIENT_TEMPERATURE_KELVIN,
);

export const cmp_returnPipe = new ThermalComponent(
	"return pipe",
	steel,
	1.0,
	AMBIENT_TEMPERATURE_KELVIN,
);
