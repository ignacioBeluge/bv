import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import MainTabs from './MainTabs';                                    // ← nuevo
import DetalleSubastaScreen from '../screens/DetalleSubastaScreen';
import CatalogoScreen from '../screens/CatalogoScreen';
import DetalleItemScreen from '../screens/DetalleItemScreen';
import PujaScreen from '../screens/PujaScreen';
import RegistroPaso1Screen from '../screens/RegistroPaso1Screen';
import CuentaEnRevisionScreen from '../screens/CuentaEnRevisionScreen';
import RegistroPaso2Screen from '../screens/RegistroPaso2Screen';
import MediosPagoScreen from '../screens/MediosPagoScreen';
import AgregarTarjetaScreen from '../screens/AgregarTarjetaScreen';
import AgregarCuentaScreen from '../screens/AgregarCuentaScreen';
import AgregarChequeScreen from '../screens/AgregarChequeScreen';
import PublicarArticuloScreen from '../screens/PublicarArticuloScreen';
import DetalleArticuloScreen from '../screens/DetalleArticuloScreen';




const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName="Login"
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="RegistroPaso1" component={RegistroPaso1Screen} />
        <Stack.Screen name="CuentaEnRevision" component={CuentaEnRevisionScreen} />
        <Stack.Screen name="RegistroPaso2" component={RegistroPaso2Screen} />

        {/* MainTabs reemplaza a Home — contiene la barra inferior */}
        <Stack.Screen name="Home" component={MainTabs} />

        {/* Estas se abren encima de los tabs, sin la barra */}
        <Stack.Screen name="DetalleSubasta" component={DetalleSubastaScreen} />
        <Stack.Screen name="Catalogo" component={CatalogoScreen} />
        <Stack.Screen name="DetalleItem" component={DetalleItemScreen} />
        <Stack.Screen name="Puja" component={PujaScreen} />
        <Stack.Screen name="MediosPago" component={MediosPagoScreen} />
        <Stack.Screen name="AgregarTarjeta" component={AgregarTarjetaScreen} />
        <Stack.Screen name="AgregarCuenta" component={AgregarCuentaScreen} />
        <Stack.Screen name="AgregarCheque" component={AgregarChequeScreen} />
        <Stack.Screen name="PublicarArticulo" component={PublicarArticuloScreen} />
        <Stack.Screen name="DetalleArticulo" component={DetalleArticuloScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}