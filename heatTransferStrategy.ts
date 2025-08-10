import type { ThermalComponent } from "./classes";

export const STEFANBOLTZMANN = 5.670374419e-8; // [W/m²·K⁴]

export interface HeatTransferStrategy {
	calculateHeatTransfer(
		node1: ThermalComponent,
		node2: ThermalComponent,
	): number; // returns heat in Watts
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

export class AdvectionStrategy implements HeatTransferStrategy {
	constructor(
		private massFlowRate: number, // [kg/s]
	) {}

	calculateHeatTransfer(from: ThermalComponent, to: ThermalComponent): number {
		if (from.material !== to.material) {
			throw new Error(
				"AdvectionStrategy requires both components to have the same material.",
			);
		}

		return (
			this.massFlowRate *
			from.material.specificHeat *
			(from.temperature - to.temperature)
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
