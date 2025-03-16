import React, { useEffect, useState } from "react";
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
import * as Sentry from "sentry-expo";

Sentry.init({
	dsn: "https://687e2d35e9a265e7706efad2e0ae2f71@o337120.ingest.sentry.io/4505921975222272",
	enableInExpoDevelopment: true,
	debug: false, // If `true`, Sentry will try to print out useful debugging information if something goes wrong with sending the event. Set it to `false` in production
});

type Tab = {
	url: string;
	icon: "home" | "information-circle" | "help-circle" | "exit";
};

// Constants
const WEB_HOST = "https://next.yalies.io/";
const API_HOST = "https://api.yalies.io/v2/";
const Colors = { darker: "#00356b", lighter: "#fff" };


const TABS = [
	{ url: WEB_HOST + "/", icon: "home" },
	{ url: WEB_HOST + "about", icon: "information-circle" },
	{ url: WEB_HOST + "faq", icon: "help-circle" },
	{ url: WEB_HOST + "logout/", icon: "exit" },
];

function App() {
	const isDarkMode = useColorScheme() === "dark";
	const [activeTab, setActiveTab] = useState(0);
	const [url, setUrl] = useState<string>(WEB_HOST + "/");

	const handleLogoutPress = async () => {
		setUrl(API_HOST + "login/logout");
	};

	const safeAreaStyle = {
		backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
		flex: 1,
	};
	const statusBarStyle = isDarkMode ? "light-content" : "dark-content";

	return (
		<SafeAreaView style={safeAreaStyle}>
			<StatusBar
				barStyle={statusBarStyle}
				backgroundColor={safeAreaStyle.backgroundColor}
			/>
			<WebViewScreen url={url} />
			<View style={styles.tabContainer}>
				{TABS.map((tab, index) => (
					<TouchableOpacity
						key={index}
						onPress={async () => {
							setActiveTab(index);
							setUrl(tab.url);
							if (tab.icon === "exit") {
								await handleLogoutPress();
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
	const webViewRef = React.useRef<WebView>(null);
	const [currentUrl, setCurrentUrl] = useState(url);

	useEffect(() => {
		setCurrentUrl(url);
	}, [url]);

	// Hide the navbar, and its container
	const injectInitialCSS = `
    const style = document.createElement('style');
    style.innerHTML = \`
        nav, div:has(> nav) {
            display: none !important;
        }
    \`;
    document.head.appendChild(style);
	`;

	return (
		<WebView
			ref={webViewRef}
			injectedJavaScript={injectInitialCSS}
			source={{
				uri: currentUrl,
			}}
			onError={(syntheticEvent) => {
				const { nativeEvent } = syntheticEvent;
				console.warn("WebView error: ", nativeEvent);
				Sentry.Native.captureException(nativeEvent);
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
				Sentry.Native.captureException(nativeEvent.statusCode);
			}}
			style={{ flex: 1 }}
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
