import { atom } from "recoil";

export const userInfo = atom(
    {
        key:"user",
        default:'iBeamKung'
    }
)

export const MachineSelector = atom(
    {
        key: "MachineSelector",
        default: 'xx'
    }
)