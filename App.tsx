// import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState, useRef } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	StatusBar,
	SafeAreaView,
} from "react-native";
import { WebView } from "react-native-webview";
import { useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Tab = {
	url: string;
	icon: "home" | "information-circle" | "help-circle" | "exit";
};

const HOST = "https://yalies.io/";

const tabs: Tab[] = [
	{
		url: "https://secure.its.yale.edu/cas/login?service=http%3A%2F%2Fyalies.io%2Fdummy%2F",
		icon: "home",
	},
	{ url: HOST + "about", icon: "information-circle" },
	{ url: HOST + "faq", icon: "help-circle" },
	{ url: HOST + "logout/", icon: "exit" },
];

const Colors = {
	darker: "#00356b",
	lighter: "#fff",
};

const LandingScreen = ({ onLoginPress }: { onLoginPress: any }) => {
	// Check if the user is already logged in when the component mounts
	useEffect(() => {
		const checkLoginStatus = async () => {
			const isLogged = await AsyncStorage.getItem("isLogged");
			if (isLogged === "true") {
				onLoginPress();
			}
		};

		checkLoginStatus();
	}, [onLoginPress]);

	// Function to handle login button press
	const handleLoginPress = async () => {
		await AsyncStorage.setItem("isLogged", "true"); // Save login status
		onLoginPress();
	};

	return (
		<LinearGradient
			colors={["#00356B", "#0088CC"]}
			style={styles.landingContainer}
		>
			<Text style={styles.title}>Yalies</Text>
			<Text style={styles.subtitle}>The App</Text>
			<TouchableOpacity style={styles.loginButton} onPress={handleLoginPress}>
				<Text style={styles.buttonText}>Log in with CAS</Text>
			</TouchableOpacity>
			<Text style={styles.subText}>Make sure to click "save for 90 days"</Text>
		</LinearGradient>
	);
};

function App() {
	const isDarkMode = useColorScheme() === "dark";
	const [showLandingScreen, setShowLandingScreen] = useState(true);
	const [activeTab, setActiveTab] = useState(0);

	const safeAreaStyle = {
		backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
		flex: 1,
	};

	const statusBarStyle = isDarkMode ? "light-content" : "dark-content";

	if (showLandingScreen) {
		return (
			<View style={safeAreaStyle}>
				<StatusBar
					barStyle={statusBarStyle}
					backgroundColor={safeAreaStyle.backgroundColor}
				/>
				<LandingScreen
					onLoginPress={() => {
						setActiveTab(0);
						setShowLandingScreen(false);
					}}
				/>
			</View>
		);
	}

	// Function to handle login button press
	const handleLogoutPress = async () => {
		await AsyncStorage.setItem("isLogged", "false"); // Save login status
		setShowLandingScreen(true);
	};

	return (
		<SafeAreaView style={safeAreaStyle}>
			<StatusBar
				barStyle={statusBarStyle}
				backgroundColor={safeAreaStyle.backgroundColor}
			/>
			<WebViewScreen url={tabs[activeTab].url} />
			<View style={styles.tabContainer}>
				{tabs.map((tab, index) => (
					<TouchableOpacity
						key={index}
						onPress={() => {
							setActiveTab(index);
							if (tab.icon === "exit") {
								handleLogoutPress();
							}
						}}
						style={styles.tabButton}
					>
						<Ionicons
							name={tab.icon}
							size={20}
							color={isDarkMode ? "#fff" : "#00356b"}
						/>
					</TouchableOpacity>
				))}
			</View>
		</SafeAreaView>
	);
}

const WebViewScreen = ({ url }: { url: string }) => {
	let hasAuthenticated = false;
	const webViewRef = React.useRef<WebView>(null);

	const hideElementsScript = `
        window.ReactNativeWebView.postMessage(document.cookie);

        var banner = document.querySelector(".banner");
        if (banner) {
          banner.style.display = "none";
        }

        var nav = document.querySelector("nav");
        if (nav) {
          nav.style.display = "none";
        }

        void(0); // void(0) ensures the injected script does not return anything
    `;

	const handleLoadEnd = () => {
		if (webViewRef.current) {
			webViewRef.current?.injectJavaScript(hideElementsScript);
		}
	};

    const login = (user, token) => {
        return AsyncStorage.multiSet([
            ['@user', JSON.stringify(user)],
            ['@token', token],
        ]);
    };
    const getToken = async () => {
        return await AsyncStorage.getItem('@token');
    };
    const getHeaders = async () => {
        let headers = {};
        let token = await getToken();
        if (token) {
            headers['Authorization'] = 'Bearer ' + token;
        }
        console.log(headers);
        return headers;
    };
    const post = async (endpoint, data = null, options = null) => {
        return axios.post(HOST + endpoint, data, {
            ...options,
            headers: await getHeaders(),
        });
    };
    const authorize = (ticket) => post('authorize', null, { params: { ticket: ticket } });

	return (
		<WebView
			ref={webViewRef}
			onLoadEnd={handleLoadEnd}
			source={{
				uri: url,
				headers: getHeaders(),
			}}
			onError={(syntheticEvent) => {
				const { nativeEvent } = syntheticEvent;
				console.warn("WebView error: ", nativeEvent);
			}}
			userAgent="Yalies Mobile App"
			onLoad={() => console.log("WebView loaded!")}
			sharedCookiesEnabled={true}
			thirdPartyCookiesEnabled={true}
			domStorageEnabled={true}
			onMessage={(event) => console.log(event.nativeEvent.data)}
			onHttpError={(syntheticEvent) => {
				const { nativeEvent } = syntheticEvent;
				console.warn(
					"WebView received error status code: ",
					nativeEvent.statusCode
				);
			}}
			style={{ flex: 1 }}
            onNavigationStateChange={({ url }) => {
                if (!hasAuthenticated && url.includes('ticket=')) {
                    // Prevent multiple firings
                    hasAuthenticated = true;
                    console.log('DOING AUTH' + url)
                    try {
                        // TODO: this is fragile and would break if there were other URL parameters. Create better solution?
                        let ticket = url.split('ticket=')[1];
                        console.log('DOING AUTH' + ticket)
                        authorize(ticket).then((authorization) => {
                            let { user, token } = authorization;
                            login(user, token);
                            console.log('Just did login!');
                        })
                        .catch((err) => {
                            console.log('Something went wrong with the auth!');
                            console.log(err);
                        });
                    } catch (e) {
                        alert('Sorry, CAS rejected your login. Please try again later.');
                    }
                }
            }}
		/>
	);
};

const styles = StyleSheet.create({
	tabContainer: {
		flexDirection: "row",
	},
	tabButton: {
		flex: 1,
		padding: 10,
		alignItems: "center",
		justifyContent: "center",
	},
	landingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	title: {
		fontSize: 50,
		fontWeight: "bold",
		color: "#fff",
		marginBottom: 10,
	},
	subtitle: {
		fontSize: 26,
		fontWeight: "bold",
		color: "#fff",
		marginBottom: 100,
	},
	loginButton: {
		backgroundColor: "#fff",
		paddingHorizontal: 20,
		paddingVertical: 10,
		borderRadius: 5,
		marginBottom: 20,
	},
	buttonText: {
		color: "#00356B",
	},
	subText: {
		color: "#fff",
		textAlign: "center",
	},
});

export default App;
