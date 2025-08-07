import * as csvWriter from "csv-writer";

const STEFANBOLTZMANN = 5.670374419e-8; // [W/m²·K⁴]
// TODO: add mass flow rate handling to simulate fluid pump

export interface HeatTransferStrategy {
	calculateHeatTransfer(
		node1: ThermalComponent,
		node2: ThermalComponent,
	): number; // returns heat in Watts
}

export interface Material {
	name: string;
	thermalConductivity: number; // [W/m·K]
	specificHeat: number; // [J/kg·K] Number.MAX_SAFE_INTEGER?
	emissivity?: number; // [0-1] for radiation calculations
	absorptivity?: number; // [0-1] for radiation calculations
	density: number; // [kg/m³]
}

export class ConvectionStrategy implements HeatTransferStrategy {
	constructor(
		private surfaceArea: number, // [m²]
		private heatTransferCoefficient: number, // [W/m²·K]
	) {}

	calculateHeatTransfer(
		fluid: ThermalComponent,
		surface: ThermalComponent,
	): number {
		return (
			this.heatTransferCoefficient *
			this.surfaceArea *
			(fluid.temperature - surface.temperature)
		);
	}
}

export class RadiationStrategy implements HeatTransferStrategy {
	constructor(
		private surfaceArea: number, // [m²]
	) {}

	calculateHeatTransfer(
		surface: ThermalComponent,
		surroundings: ThermalComponent,
	): number {
		if (!surface.material.emissivity) {
			throw new Error(
				"Surface emissivity must be defined for radiation calculations.",
			);
		}

		return (
			surface.material.emissivity *
			STEFANBOLTZMANN *
			this.surfaceArea *
			(surface.temperature ** 4 - surroundings.temperature ** 4)
		);
	}
}

export class ConductionStrategy implements HeatTransferStrategy {
	constructor(
		private length: number, // [m]
		private surfaceArea: number, // [m²]
	) {}

	calculateHeatTransfer(from: ThermalComponent, to: ThermalComponent): number {
		const deltaTemp = from.temperature - to.temperature;

		return (
			(from.material.thermalConductivity * this.surfaceArea * deltaTemp) /
			this.length
		);
	}
}

export class SolarAbsorbtionStrategy implements HeatTransferStrategy {
	constructor(
		private wattsPerMeterSquared: number,
		private surfaceAreaMetersSquared: number,
	) {}

	calculateHeatTransfer(from: ThermalComponent, to: ThermalComponent): number {
		if (!to.material.absorptivity) {
			throw new Error(
				"Target material absorptivity must be defined for ambient heat transfer calculations.",
			);
		}
		return (
			this.wattsPerMeterSquared *
			this.surfaceAreaMetersSquared *
			to.material.absorptivity
		);
	}
}

export class ThermalComponent {
	readonly id: string;
	material: Material;
	volume: number; // [m³]
	temperature: number; // [K]
	log: number[][] = []; // [time, temperature] pairs

	constructor(
		id: string,
		material: Material,
		volume: number,
		initialTemp: number,
	) {
		this.id = id;
		this.material = material;
		this.volume = volume;
		this.temperature = initialTemp;
	}

	setTemperature(newTemp: number, time: number) {
		this.temperature = newTemp;
		this.log.push([time, newTemp]);
	}

	getHeatCapacity(): number {
		const mass = this.material.density * this.volume; // [kg]
		return mass * this.material.specificHeat; // [J/K]
	}
}

export class HeatTransferEdge {
	from: ThermalComponent;
	to: ThermalComponent;
	strategy: HeatTransferStrategy;

	constructor(
		from: ThermalComponent,
		to: ThermalComponent,
		strategy: HeatTransferStrategy,
	) {
		this.from = from;
		this.to = to;
		this.strategy = strategy;
	}

	calculateHeatFlow(): number {
		return this.strategy.calculateHeatTransfer(this.from, this.to); // returns heat [W]
	}
}

export class ThermalGraph {
	nodes: ThermalComponent[] = [];
	edges: HeatTransferEdge[] = [];

	simulateStep(dt: number, elapsedTime: number) {
		const componentToNetHeat = new Map<ThermalComponent, number>();

		// Initialize net heat to 0
		for (const node of this.nodes) {
			componentToNetHeat.set(node, 0);
		}

		// Calculate heat transfers across edges
		for (const edge of this.edges) {
			const q = edge.calculateHeatFlow(); // [W]
			componentToNetHeat.set(
				edge.from,
				(componentToNetHeat.get(edge.from) ?? 0) - q,
			);
			componentToNetHeat.set(
				edge.to,
				(componentToNetHeat.get(edge.to) ?? 0) + q,
			);
		}

		// Update temperatures
		for (const node of this.nodes) {
			const netQ = componentToNetHeat.get(node) ?? 0;
			const deltaT = (netQ * dt) / node.getHeatCapacity();
			node.setTemperature(node.temperature + deltaT, elapsedTime);
		}
	}

	writeNodeLogsToCSV() {
		Promise.all(
			this.nodes.map(async (node) => {
				const writer = csvWriter.createObjectCsvWriter({
					path: `./${node.id.split(" ").join("_")}.csv`,
					header: [
						{ id: "time", title: "Time" },
						{ id: "temperature", title: "Temperature" },
					],
				});

				const records = node.log.map(([time, temperature]) => {
					const record: Record<string, number | string> = {};
					record.time = time;
					record.temperature = temperature;
					return record;
				});

				await writer.writeRecords(records);
			}),
		);
	}
}
