import { HeatTransferEdge } from "./classes";
import {
	cmp_ambientAir,
	cmp_fluidContactingPanel,
	cmp_fluidInPipe,
	cmp_pipe,
	cmp_solarPanel,
	cmp_solarRadiation,
	cmp_fluidInStorage,
	cmp_heatExchanger,
	cmp_returnPipe,
	cmp_storageTank,
	cmp_fluidInHeatExchanger,
} from "./components";
import {
	ConductionStrategy,
	ConvectionStrategy,
	SolarAbsorbtionStrategy,
} from "./heatTransferStrategy";

export const waterToWaterHeatTransferCoefficient = 340; // [W/m²·K]
export const pipeLength = 10; // [m]
export const pipeSurfaceArea = 0.2; // [m²]
export const exchangerSurfaceArea = 0.2; // [m²]
export const storageTankSurfaceArea = 3.0; // [m²]
export const solarPanelSurfaceArea = 4.0; // [m²]

export const e_solarRadiation = new HeatTransferEdge(
	cmp_solarRadiation,
	cmp_solarPanel,
	new SolarAbsorbtionStrategy(1000, solarPanelSurfaceArea), // 1000 W/m² solar radiation, 1.0 m² surface area
);

export const e_panelToFluid = new HeatTransferEdge(
	cmp_solarPanel,
	cmp_fluidContactingPanel,
	new ConductionStrategy(1, pipeSurfaceArea),
);

export const e_fluidToPipe = new HeatTransferEdge(
	cmp_fluidInPipe,
	cmp_pipe,
	new ConductionStrategy(pipeLength, pipeSurfaceArea),
);

export const e_fluidToFluidInPipe = new HeatTransferEdge(
	cmp_fluidContactingPanel,
	cmp_fluidInPipe,
	new ConvectionStrategy(1, waterToWaterHeatTransferCoefficient),
);

export const e_pipeToAir = new HeatTransferEdge(
	cmp_pipe,
	cmp_ambientAir,
	new ConductionStrategy(pipeLength, pipeSurfaceArea),
);

export const e_panelToAir = new HeatTransferEdge(
	cmp_solarPanel,
	cmp_ambientAir,
	new ConductionStrategy(1.0, solarPanelSurfaceArea),
);

export const e_fluidInExchangerToExchanger = new HeatTransferEdge(
	cmp_fluidInHeatExchanger,
	cmp_heatExchanger,
	new ConductionStrategy(pipeLength, exchangerSurfaceArea),
);

export const e_exchangerToFluidInStorage = new HeatTransferEdge(
	cmp_heatExchanger,
	cmp_fluidInStorage,
	new ConductionStrategy(pipeLength, exchangerSurfaceArea),
);

export const e_fluidInStorageToStorageTank = new HeatTransferEdge(
	cmp_fluidInStorage,
	cmp_storageTank,
	new ConductionStrategy(pipeLength, storageTankSurfaceArea),
);
