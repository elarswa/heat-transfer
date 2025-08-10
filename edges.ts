import { HeatTransferEdge } from "./classes";
import {
	cmp_ambientAir,
	cmp_fluidContactingPanel,
	cmp_fluidInPipe,
	cmp_pipe,
	cmp_solarPanel,
	cmp_solarRadiation,
	cmp_fluidInReturnPipe,
	cmp_heatExchanger,
	cmp_returnPipe,
	cmp_storageTank,
	cmp_fluidInHeatExchanger,
	cmp_fluidInStorage,
} from "./components";
import {
	ConductionStrategy,
	ConvectionStrategy,
	SolarAbsorbtionStrategy,
} from "./heatTransferStrategy";

// https://www.engineersedge.com/heat_transfer/convective_heat_transfer_coefficients__13378.htm
export const waterToWaterHeatTransferCoefficient = 340; // [W/m²·K]
export const lowAirSpeedHeatTransferCoefficient = 10; // [W/m²·K]
export const highAirSpeedHeatTransferCoefficient = 100; // [W/m²·K]
export const pipeLength = 10; // [m]
export const pipeSurfaceArea = 0.5; // [m²]
export const exchangerSurfaceArea = 35.0; // [m²]
export const storageTankSurfaceArea = 3.0; // [m²]
export const solarPanelSurfaceArea = 10.0; // [m²]

// #region SOLAR
const e_solarRadiation = new HeatTransferEdge(
	cmp_solarRadiation,
	cmp_solarPanel,
	new SolarAbsorbtionStrategy(1000, solarPanelSurfaceArea), // 1000 W/m² solar radiation, 1.0 m² surface area
);

const e_panelToFluid = new HeatTransferEdge(
	cmp_solarPanel,
	cmp_fluidContactingPanel,
	new ConductionStrategy(1, solarPanelSurfaceArea * 0.8),
);
// #endregion

// #region AIR
const e_pipeToAir = new HeatTransferEdge(
	cmp_pipe,
	cmp_ambientAir,
	new ConvectionStrategy(pipeSurfaceArea, lowAirSpeedHeatTransferCoefficient),
);

const e_panelToAir = new HeatTransferEdge(
	cmp_solarPanel,
	cmp_ambientAir,
	new ConvectionStrategy(
		solarPanelSurfaceArea,
		lowAirSpeedHeatTransferCoefficient,
	),
);

const e_storageTankToAir = new HeatTransferEdge(
	cmp_storageTank,
	cmp_ambientAir,
	new ConvectionStrategy(
		storageTankSurfaceArea,
		lowAirSpeedHeatTransferCoefficient,
	),
);

const e_returnPipeToAir = new HeatTransferEdge(
	cmp_returnPipe,
	cmp_ambientAir,
	new ConvectionStrategy(pipeSurfaceArea, lowAirSpeedHeatTransferCoefficient),
);
// #endregion

// #region PIPES
const e_fluidToPipe = new HeatTransferEdge(
	cmp_fluidInPipe,
	cmp_pipe,
	new ConductionStrategy(pipeLength, pipeSurfaceArea),
);

const e_fluidInExchangerToExchanger = new HeatTransferEdge(
	cmp_fluidInHeatExchanger,
	cmp_heatExchanger,
	new ConductionStrategy(pipeLength, exchangerSurfaceArea),
);

const e_exchangerToFluidInStorage = new HeatTransferEdge(
	cmp_heatExchanger,
	cmp_fluidInStorage,
	new ConductionStrategy(pipeLength, exchangerSurfaceArea),
);

const e_fluidInStorageToStorageTank = new HeatTransferEdge(
	cmp_fluidInStorage,
	cmp_storageTank,
	new ConductionStrategy(pipeLength, storageTankSurfaceArea),
);

const e_fluidInReturnPipeToReturnPipe = new HeatTransferEdge(
	cmp_fluidInReturnPipe,
	cmp_returnPipe,
	new ConductionStrategy(pipeLength, pipeSurfaceArea),
);
// #endregion

// #region Fluid
const e_fluidToFluidInPipe = new HeatTransferEdge(
	cmp_fluidContactingPanel,
	cmp_fluidInPipe,
	new ConvectionStrategy(1, waterToWaterHeatTransferCoefficient),
);

const e_fluidToHeatExchangeFluid = new HeatTransferEdge(
	cmp_fluidInPipe,
	cmp_fluidInHeatExchanger,
	new ConvectionStrategy(1, waterToWaterHeatTransferCoefficient),
);

const e_heatExchangeFluidToReturnFluid = new HeatTransferEdge(
	cmp_fluidInHeatExchanger,
	cmp_fluidInReturnPipe,
	new ConvectionStrategy(1, waterToWaterHeatTransferCoefficient),
);

const e_fluidInReturnToFluidAtPanel = new HeatTransferEdge(
	cmp_fluidInReturnPipe,
	cmp_fluidContactingPanel,
	new ConvectionStrategy(1, waterToWaterHeatTransferCoefficient),
);
// #endregion
export const allEdges = [
	e_exchangerToFluidInStorage,
	e_fluidInExchangerToExchanger,
	e_fluidInReturnPipeToReturnPipe,
	e_fluidInReturnToFluidAtPanel,
	e_fluidInStorageToStorageTank,
	e_fluidToFluidInPipe,
	e_fluidToHeatExchangeFluid,
	e_fluidToPipe,
	e_heatExchangeFluidToReturnFluid,
	e_panelToAir,
	e_panelToFluid,
	e_pipeToAir,
	e_returnPipeToAir,
	e_solarRadiation,
	e_storageTankToAir,
];
