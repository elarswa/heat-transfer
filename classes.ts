import * as csvWriter from "csv-writer";
import type { HeatTransferStrategy } from "./heatTransferStrategy";

// TODO: add mass flow rate handling to simulate fluid pump

export interface Material {
	name: string;
	thermalConductivity: number; // [W/m·K]
	specificHeat: number; // [J/kg·K] Number.MAX_SAFE_INTEGER?
	emissivity?: number; // [0-1] for radiation calculations
	absorptivity?: number; // [0-1] for radiation calculations
	density: number; // [kg/m³]
}

export class ThermalComponent {
	readonly id: string;
	material: Material;
	volume: number; // [m³]
	temperature: number; // [K]
	log: number[][] = []; // [time, temperature] pairs
	logAsCelcius = true;

	constructor(
		id: string,
		material: Material,
		volume: number,
		initialTemp: number,
	) {
		this.id = `${id.split(" ").join("_")} ${material.name.split(" ").join("_")}`;
		this.material = material;
		this.volume = volume;
		this.temperature = initialTemp;
	}

	setTemperature(newTemp: number, time: number) {
		this.temperature = newTemp;
		const tempToLog = this.logAsCelcius ? newTemp - 273.15 : newTemp;
		this.log.push([time, tempToLog]);
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
	/** Thermal Components utilized in HeatTransferEdges which you want logging heat over time */
	nodes: ThermalComponent[] = [];
	/** HeatTransferEdges connecting ThermalComponents. Represents all heat transfers in the system */
	edges: HeatTransferEdge[] = [];

	/**
	 * key: flow rate m^3/s
	 * value: ordered list of components in the flow path
	 */
	flowMap: Map<number, ThermalComponent[]> = new Map();

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

	async writeNodeLogsToCSV() {
		const nodeToIds = new Map<ThermalComponent, { temperature: string }>();

		const headers = this.nodes.flatMap((node) => {
			const { temperature } = (() => {
				const safeId = node.id;
				const temperature = `temperature_${safeId}`;
				nodeToIds.set(node, {
					temperature: temperature,
				});
				return { temperature: temperature };
			})();

			return [
				{
					id: temperature,
					title: `Temperature ${node.id}`,
				},
			];
				});
		headers.unshift({
			id: "time",
			title: "Time (s)",
		});

		const maxLogLength = Math.max(...this.nodes.map((node) => node.log.length));

		const records: Record<string, number | string>[] = [];
		for (let i = 0; i < maxLogLength; i++) {
			const time = this.nodes[0].log[i][0];
			const record: Record<string, number | string> = { time };

			for (const node of this.nodes) {
				const { temperature } = nodeToIds.get(node) || {};

				if (!temperature) throw new Error("Node ID not found");

				if (node.log[i]) {
					record[temperature] = node.log[i][1];
				} else {
					record[temperature] = "";
				}
			}

			records.push(record);
		}

		const writer = csvWriter.createObjectCsvWriter({
			path: "./results.csv",
			header: headers,
				});

				await writer.writeRecords(records);
	}
}
