solar system - models a active closed loop solar water heating system as found here https://www.energy.gov/energysaver/solar-water-heaters
collector is typically made of copper, stainless steel, or aluminum

## 1D Transient Conduction
dT/dt = alpha * d2T/dx2

| Variable | Description                                             | Units            |
| -------- | ------------------------------------------------------- | ---------------- |
| T        | Temperature at position x and time t                    | K (Kelvin) or °C |
| t        | Time                                                    | seconds (s)      |
| x        | Spatial position along 1D direction                     | meters (m)       |
| dT/dt    | Rate of temperature change over time                    | K/s              |
| d2T/dx2  | Curvature of temperature over space (second derivative) | K/m²             |
| alpha    | Thermal diffusivity = k / (rho \* cp)                   | m²/s             |
| k        | Thermal conductivity                                    | W/m·K            |
| rho      | Density of material                                     | kg/m³            |
| cp       | Specific heat capacity                                  | J/kg·K           |

## Conduction
q_cond = (kA/L) * (T1 - T2)

## 1D Transient Convection
q_conv = h * A * (T_surface - T_fluid)

| Variable   | Description                             | Units     |
| ---------- | --------------------------------------- | --------- |
| q\_conv    | Heat transfer rate due to convection    | Watts (W) |
| h          | Convective heat transfer coefficient    | W/m²·K    |
| A          | Surface area where heat transfer occurs | m²        |
| T\_surface | Temperature of the surface              | K or °C   |
| T\_fluid   | Temperature of the surrounding fluid    | K or °C   |

## 1D Transient Radiation
q_rad = epsilon * sigma * A * (T_surface^4 - T_surroundings^4)

| Variable        | Description                               | Units     |
| --------------- | ----------------------------------------- | --------- |
| q\_rad          | Heat transfer rate due to radiation       | Watts (W) |
| epsilon         | Emissivity of the surface (range: 0 to 1) | Unitless  |
| sigma           | Stefan-Boltzmann constant ≈ 5.670e-8      | W/m²·K⁴   |
| A               | Surface area where heat transfer occurs   | m²        |
| T\_surface      | Temperature of the radiating surface      | K         |
| T\_surroundings | Temperature of surrounding environment    | K         |

https://ntrs.nasa.gov/api/citations/20200006182/downloads/Introduction%20to%20Numerical%20Methods%20in%20Heat%20Transfer.pdf

## Governing equation Explicit Finite Difference
initial_temp_node_i + (time_step * (thermal_conductivity / (density * specific_heat)) * (initial_temp_node_i - next_node_initial_temp)/step_length^2) + time_step / (density * specific_heat) * energy_per_unit_time_entering_system = temp_node_i_at_next_time_step
