import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer, CommonActions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../hooks/useNotifications';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Main Screens
import ReceitasScreen from '../screens/receitas/ReceitasScreen';
import ReceitaDetailScreen from '../screens/receitas/ReceitaDetailScreen';
import TreinosScreen from '../screens/treinos/TreinosScreen';
import TreinoDetailScreen from '../screens/treinos/TreinoDetailScreen';
import ExerciseDetailScreen from '../screens/treinos/ExerciseDetailScreen';
import ModalityWorkoutsScreen from '../screens/treinos/ModalityWorkoutsScreen';
import BibliotecaTreinosScreen from '../screens/treinos/BibliotecaTreinosScreen';
import FavoritosScreen from '../screens/favoritos/FavoritosScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import SubscriptionsScreen from '../screens/subscriptions/SubscriptionsScreen';
import PrivacyPolicyScreen from '../screens/legal/PrivacyPolicyScreen';
import TermsOfServiceScreen from '../screens/legal/TermsOfServiceScreen';
import NotificationSettingsScreen from '../screens/settings/NotificationSettingsScreen';
import MacrosCalculatorScreen from '../screens/macros/MacrosCalculatorScreen';
import FeedScreen from '../screens/feed/FeedScreen';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
};

export type MainTabParamList = {
  Feed: undefined;
  Receitas: undefined;
  Treinos: undefined;
  Favoritos: undefined;
  Profile: undefined;
};

export type MainStackParamList = {
  Tabs: undefined;
  Feed: undefined;
  ReceitaDetail: { receitaId: string };
  TreinoDetail: { treinoId: string };
  ExerciseDetail: { treinoId: string };
  Subscriptions: undefined;
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
  NotificationSettings: undefined;
  MacrosCalculator: undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainTabs = createBottomTabNavigator<MainTabParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{
          title: 'Política de Privacidade',
          headerShown: true,
          headerStyle: { backgroundColor: '#1a1a1a' },
          headerTintColor: '#c8921a',
        }}
      />
      <AuthStack.Screen
        name="TermsOfService"
        component={TermsOfServiceScreen}
        options={{
          title: 'Termos de Uso',
          headerShown: true,
          headerStyle: { backgroundColor: '#1a1a1a' },
          headerTintColor: '#c8921a',
        }}
      />
    </AuthStack.Navigator>
  );
}

// Stack Navigator para Receitas (inclui lista e detalhes)
function ReceitasStack() {
  const ReceitasStackNav = createNativeStackNavigator();
  return (
    <ReceitasStackNav.Navigator
      initialRouteName="ReceitasList"
    >
      <ReceitasStackNav.Screen
        name="ReceitasList"
        component={ReceitasScreen}
        options={{ headerShown: false }}
      />
      <ReceitasStackNav.Screen
        name="ReceitaDetail"
        component={ReceitaDetailScreen}
        options={{
          title: 'Detalhes da Receita',
          headerStyle: { backgroundColor: '#1a1a1a' },
          headerTintColor: '#c8921a',
          headerBackTitleVisible: false,
        }}
      />
    </ReceitasStackNav.Navigator>
  );
}

// Stack Navigator para Treinos (inclui lista e detalhes)
function TreinosStack() {
  const TreinosStackNav = createNativeStackNavigator();
  return (
    <TreinosStackNav.Navigator
      initialRouteName="TreinosList"
    >
      <TreinosStackNav.Screen
        name="TreinosList"
        component={TreinosScreen}
        options={{ headerShown: false }}
      />
      <TreinosStackNav.Screen
        name="TreinoDetail"
        component={TreinoDetailScreen}
        options={{
          title: 'Detalhes do Treino',
          headerStyle: { backgroundColor: '#1a1a1a' },
          headerTintColor: '#c8921a',
        }}
      />
      <TreinosStackNav.Screen
        name="ExerciseDetail"
        component={ExerciseDetailScreen}
        options={{
          headerShown: false,
        }}
      />
      <TreinosStackNav.Screen
        name="ModalityWorkouts"
        component={ModalityWorkoutsScreen}
        options={{
          headerShown: false,
        }}
      />
      <TreinosStackNav.Screen
        name="BibliotecaTreinos"
        component={BibliotecaTreinosScreen}
        options={{
          headerShown: false,
        }}
      />
    </TreinosStackNav.Navigator>
  );
}

function TabsNavigator() {
  return (
    <MainTabs.Navigator
      initialRouteName="Feed"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#c8921a',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#1a1a1a',
          borderTopColor: '#333',
        },
      }}
    >
      <MainTabs.Screen
        name="Feed"
        component={FeedScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
          tabBarLabel: 'Feed',
        }}
      />
      <MainTabs.Screen
        name="Receitas"
        component={ReceitasStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="restaurant" size={size} color={color} />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            // Se já estiver na aba de receitas, o comportamento padrão já tenta dar pop to top
            // Se estiver em outra aba, queremos garantir que ao entrar vá para a lista
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [
                  {
                    name: 'Receitas',
                    state: {
                      routes: [{ name: 'ReceitasList' }],
                    },
                  },
                ],
              })
            );
          },
        })}
      />
      <MainTabs.Screen
        name="Treinos"
        component={TreinosStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="fitness" size={size} color={color} />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [
                  {
                    name: 'Treinos',
                    state: {
                      routes: [{ name: 'TreinosList' }],
                    },
                  },
                ],
              })
            );
          },
        })}
      />
      <MainTabs.Screen
        name="Favoritos"
        component={FavoritosScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart" size={size} color={color} />
          ),
        }}
      />
      <MainTabs.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </MainTabs.Navigator>
  );
}

function MainNavigator() {
  return (
    <MainStack.Navigator>
      <MainStack.Screen name="Tabs" component={TabsNavigator} options={{ headerShown: false }} />
      <MainStack.Screen
        name="Subscriptions"
        component={SubscriptionsScreen}
        options={{
          headerShown: false,
        }}
      />
      <MainStack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{
          title: 'Política de Privacidade',
          headerStyle: { backgroundColor: '#1a1a1a' },
          headerTintColor: '#c8921a',
        }}
      />
      <MainStack.Screen
        name="TermsOfService"
        component={TermsOfServiceScreen}
        options={{
          title: 'Termos de Uso',
          headerStyle: { backgroundColor: '#1a1a1a' },
          headerTintColor: '#c8921a',
        }}
      />
      <MainStack.Screen
        name="NotificationSettings"
        component={NotificationSettingsScreen}
        options={{
          headerShown: false,
        }}
      />
      <MainStack.Screen
        name="MacrosCalculator"
        component={MacrosCalculatorScreen}
        options={{
          title: 'Calculadora de Macros',
          headerStyle: { backgroundColor: '#1a1a1a' },
          headerTintColor: '#c8921a',
        }}
      />
    </MainStack.Navigator>
  );
}

// Componente wrapper para inicializar notificações
function NavigationWithNotifications() {
  const { isAuthenticated } = useAuth();
  
  // Sempre chamar o hook, mas só registrar se autenticado
  useNotifications();

  return null;
}

export default function Navigation() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f0f0f' }}>
        <ActivityIndicator size="large" color="#c8921a" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated && <NavigationWithNotifications />}
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

