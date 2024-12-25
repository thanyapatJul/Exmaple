// atoms.js
import { atom } from 'recoil';


export const DashreloadState = atom({
  key: 'DashreloadState', // unique ID (with respect to other atoms/selectors)
  default: false,     // default value
});

export const DashmulticlickedZone_Info = atom({
  key: 'DashmulticlickedZone_Info',
  default: []
})

export const DashproductSelectedState = atom({
  key: 'DashproductSelectedState',
  default: null
});

export const DashtagClickedState = atom({
  key: 'DashtagClickedState',
  default: []
})

export const Dash_payloadState = atom({
  key: 'Dash_payloadState',
  default: []
})