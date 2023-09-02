import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const HOST = "https://yalies.io/";

export const logout = () => {
    return AsyncStorage.multiRemove([
        '@token',
    ]);
};

export const login = (token) => {
    return AsyncStorage.multiSet([
        ['@token', token],
    ]);
};

export const getToken = async () => {
    return await AsyncStorage.getItem('@token');
};
export const getHeaders = async () => {
    let headers = {};
    let token = await getToken();
    if (token) {
        headers = {
            ...headers,
            'Authorization': 'Bearer ' + token,
        };
    }
    console.log(headers);
    return headers;
};
export const post = async (endpoint, data = null, options = null) => {
    return axios.post(HOST + endpoint, data, {
        ...options,
        headers: await getHeaders(),
    });
};

export const authorize = (ticket) => post('authorize', null, { params: { ticket: ticket } });


