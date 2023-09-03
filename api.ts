import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const HOST = "https://yalies.io/";

// export const logout = async () => {
// 	return await AsyncStorage.multiRemove(["@token"]);
// };

export const logout = async () => {
	try {
		await AsyncStorage.multiRemove(["@token"]);
		console.log("Token removed");
	} catch (error) {
		console.error("AsyncStorage multiRemove Error: ", error);
	}
};

export const login = (token: string) => {
	return AsyncStorage.multiSet([["@token", token]]);
};

export const getToken = async () => {
	return await AsyncStorage.getItem("@token");
};
export const getHeaders = async () => {
	let headers: any = {};
	let token = await getToken();
	if (token) {
		headers["Authorization"] = "Bearer " + token;
	}
	return headers;
};
export const post = async (
	endpoint: string,
	data: any = null,
	options: any = null
) => {
	return axios.post(HOST + endpoint, data, {
		...options,
		headers: await getHeaders(),
	});
};

export const authorize = (ticket: string) =>
	post("authorize", null, { params: { ticket: ticket } });
