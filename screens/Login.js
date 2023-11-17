import {
	View,
	Text,
	Image,
	Pressable,
	TextInput,
	TouchableOpacity,
	Alert,
	ActivityIndicator,
} from "react-native";
import React, { useState, useContext, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import COLORS from "../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import Checkbox from "expo-checkbox";
import Button from "../components/Button";
import axios from "axios";
import { AuthContext } from "../context/authContext";
import { BASE_API_URL } from "../constants/baseApiUrl";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import {
	GoogleSignin,
	GoogleSigninButton,
	statusCodes,
} from '@react-native-google-signin/google-signin';
WebBrowser.maybeCompleteAuthSession();

const Login = ({ navigation }) => {
	const { state, setState } = useContext(AuthContext);
	const { setAuthenticatedUser } = useContext(AuthContext);
	const [loading, setLoading] = useState(true);
	const [isPasswordShown, setIsPasswordShown] = useState(false);
	const [isChecked, setIsChecked] = useState(false);
	const [phoneNumber, setPhoneNumber] = useState("");
	const [password, setPassword] = useState("");

	const [token, setToken] = useState("");
	const [userInfo, setUserInfo] = useState(null);
	GoogleSignin.configure({
		scopes: ['https://www.googleapis.com/auth/drive.readonly'], // what API you want to access on behalf of the user, default is email and profile
		webClientId: '463746785862-a1r667n088f5p85tvl31qltsgsfrsr70.apps.googleusercontent.com', // client ID of type WEB for your server (needed to verify user ID and offline access). Required to get the `idToken` on the user object!
	});
	// const [request, response, promptAsync] = Google.useAuthRequest({
	// 	androidClientId: "641271354850-s3s89c9101j3pv63i4ult965gv7uncsp.apps.googleusercontent.com",
	// 	expoClientId: "641271354850-5jd5i3o6kial8kps5mm412bg4ki82lrl.apps.googleusercontent.com",
	// });

	// useEffect(() => {
	// 	handleEffect();
	// }, [response, token]);

	// async function handleEffect() {
	// 	const user = await getLocalUser();
	// 	if (!user) {
	// 		if (response?.type === "success") {
	// 			setToken(response.authentication.accessToken);
	// 			getUserInfo(response.authentication.accessToken);
	// 		}
	// 	} else {
	// 		setUserInfo(user);
	// 	}
	// }
	async function googleLogin() {
		try {
			await GoogleSignin.hasPlayServices();
			const userInfo = await GoogleSignin.signIn();
			// console.log(userInfo)
			if (userInfo.idToken) {
				setToken(userInfo.idToken)
			}
			else {
				throw new Error("no token ID")
			}
		} catch (error) {
			if (error.code === statusCodes.SIGN_IN_CANCELLED) {
				console.log("cancelled")
			} else if (error.code === statusCodes.IN_PROGRESS) {
				console.log("In progress")
			} else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
				console.log("Gplay services not enabled")
			} else {
				console.log("something went wrong")
			}
		}
	}
	const getLocalUser = async () => {
		const data = await AsyncStorage.getItem("@user");
		if (!data) return null;
		return JSON.parse(data);
	};

	const getUserInfo = async (token) => {
		if (!token) return;
		try {
			const response = await fetch(
				"https://www.googleapis.com/userinfo/v2/me",
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);

			const user = await response.json();
			await AsyncStorage.setItem("@user", JSON.stringify(user));
			setUserInfo(user);
		} catch (error) {
			Alert.alert(error.response.data.message);
		}
	};

	const handleLogin = async () => {
		try {
			if (!phoneNumber) {
				Alert.alert("Please fill the phone number !");
			} else if (!password) {
				Alert.alert("please fill the password !");
			} else {
				setLoading(false);

				await axios.post(`${BASE_API_URL}api/user/login`, {
					phoneNumber,
					password
				}).then(async (res) => {
					if (res.status == 201) {
						Alert.alert("User not found", "Please sign up first");
						setLoading(true);
					}
					if (res.status == 200) {
						setAuthenticatedUser(true);

						setState(res.data.data);

						await AsyncStorage.setItem("@auth", JSON.stringify(res.data.data));

						navigation.navigate("PrizesData");
					}
					if (res.status == 401) {
						Alert.alert(res.data.message)
						setLoading(true);
					}
				});
			}
		} catch (error) {
			setLoading(true);
			Alert.alert(error.response.data.message);
		}
	}

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
			<View style={{ flex: 1, marginHorizontal: 22 }}>
				<View style={{ alignItems: "center" }}>
					<Text
						style={{
							fontSize: 22,
							fontWeight: "bold",
							marginTop: 20,
							color: COLORS.black,
						}}
					>
						Hi, Welcome!
					</Text>
				</View>

				<View style={{ marginBottom: 12, marginTop: 22 }}>
					<Text
						style={{
							fontSize: 16,
							fontWeight: 400,
							marginVertical: 8,
						}}
					>
						Mobile Number
					</Text>

					<View
						style={{
							width: "100%",
							height: 48,
							borderColor: COLORS.black,
							borderWidth: 1,
							borderRadius: 8,
							alignItems: "center",
							flexDirection: "row",
							justifyContent: "space-between",
							paddingLeft: 22,
						}}
					>
						<TextInput
							placeholder="+91"
							placeholderTextColor={COLORS.black}
							keyboardType="numeric"
							style={{
								width: "12%",
								borderRightWidth: 1,
								borderLeftColor: COLORS.grey,
								height: "100%",
							}}
						/>

						<TextInput
							placeholder="Enter your phone number"
							placeholderTextColor={COLORS.black}
							keyboardType="numeric"
							style={{
								width: "80%",
							}}
							value={phoneNumber}
							onChangeText={(text) => setPhoneNumber(text)}
						/>
					</View>
				</View>

				<View style={{ marginBottom: 12 }}>
					<Text
						style={{
							fontSize: 16,
							fontWeight: 400,
							marginVertical: 8,
						}}
					>
						Password
					</Text>

					<View
						style={{
							width: "100%",
							height: 48,
							borderColor: COLORS.black,
							borderWidth: 1,
							borderRadius: 8,
							alignItems: "center",
							justifyContent: "center",
							paddingLeft: 22,
						}}
					>
						<TextInput
							placeholder="Enter your password"
							placeholderTextColor={COLORS.black}
							secureTextEntry={isPasswordShown}
							style={{
								width: "100%",
							}}
							value={password}
							onChangeText={(text) => setPassword(text)}
						/>

						<TouchableOpacity
							onPress={() => setIsPasswordShown(!isPasswordShown)}
							style={{
								position: "absolute",
								right: 12,
							}}
						>
							{isPasswordShown == true ? (
								<Ionicons name="eye-off" size={24} color={COLORS.black} />
							) : (
								<Ionicons name="eye" size={24} color={COLORS.black} />
							)}
						</TouchableOpacity>
					</View>
				</View>

				<View
					style={{
						flexDirection: "row",
						marginVertical: 6,
					}}
				>
					<Checkbox
						style={{ marginRight: 8 }}
						value={isChecked}
						onValueChange={setIsChecked}
						color={isChecked ? COLORS.primary : undefined}
					/>

					<Text>Remember Me</Text>
				</View>

				{loading ?
					<Button
						title="Login"
						filled
						style={{
							marginTop: 18,
							marginBottom: 4,
						}}
						onPress={handleLogin}
					/>
					:
					<ActivityIndicator size="large" ></ActivityIndicator>
				}

				<View
					style={{
						flexDirection: "row",
						alignItems: "center",
						marginVertical: 20,
					}}
				>
					<View
						style={{
							flex: 1,
							height: 1,
							backgroundColor: COLORS.grey,
							marginHorizontal: 10,
						}}
					/>
					<Text style={{ fontSize: 14 }}>Or Login with</Text>
					<View
						style={{
							flex: 1,
							height: 1,
							backgroundColor: COLORS.grey,
							marginHorizontal: 10,
						}}
					/>
				</View>

				<View
					style={{
						flexDirection: "row",
						justifyContent: "center",
					}}
				>

					<TouchableOpacity
						onPress={() => googleLogin()}
						style={{
							flex: 1,
							alignItems: "center",
							justifyContent: "center",
							flexDirection: "row",
							height: 52,
							borderWidth: 1,
							borderColor: COLORS.grey,
							marginRight: 4,
							borderRadius: 10,
						}}
					>
						<Image
							source={require("../assets/google.png")}
							style={{
								height: 36,
								width: 36,
								marginRight: 8,
							}}
							resizeMode="contain"
						/>

						<Text>Google</Text>
					</TouchableOpacity>
				</View>

				<View
					style={{
						flexDirection: "row",
						justifyContent: "center",
						marginVertical: 22,
					}}
				>
					<Text style={{ fontSize: 16, color: COLORS.black }}>
						Don't have an account ?{" "}
					</Text>
					<Pressable onPress={() => navigation.navigate("Signup")}>
						<Text
							style={{
								fontSize: 16,
								color: COLORS.primary,
								fontWeight: "bold",
								marginLeft: 6,
							}}
						>
							Register
						</Text>
					</Pressable>
				</View>
				<View
					style={{
						flexDirection: "row",
						justifyContent: "center",
						marginVertical: 16,
					}}
				>
					<Text style={{ fontSize: 16, color: COLORS.black }}>
						Forgot Password ?{" "}
					</Text>
					<Pressable onPress={() => navigation.navigate("ForgetPassword")}>
						<Text
							style={{
								fontSize: 16,
								color: COLORS.primary,
								fontWeight: "bold",
								marginLeft: 6,
							}}
						>
							Forgot Password
						</Text>
					</Pressable>
				</View>
			</View>
		</SafeAreaView>
	);
};

export default Login;
