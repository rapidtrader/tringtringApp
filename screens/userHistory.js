import { View, Text, Dimensions, FlatList, ScrollView, ActivityIndicator } from 'react-native';
import React, { useContext, useState } from 'react';
import COLORS from "../constants/colors";
import EStyleSheet from 'react-native-extended-stylesheet';
import { BASE_API_URL } from '../constants/baseApiUrl';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { AuthContext } from '../context/authContext';
import FooterMenu from '../components/Menus/FooterMenu';
import { formatTimestampToTimeDate } from '../constants/dataTime';
let entireScreenWidth = Dimensions.get('window').width;

EStyleSheet.build({ $rem: entireScreenWidth / 380 });

const UserHistory = ({ navigation }) => {
    const [data, setData] = useState();
    const [isData, setIsData] = useState(false);
    const [loading, setLoading] = useState(false);

    const { state } = useContext(AuthContext);

    useFocusEffect(
        React.useCallback(() => {
            async function fetchData() {
                const token = state?.token;
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                };
                try {
                    setLoading(true);

                    const result = await axios.get(`${BASE_API_URL}api/winning/user/user_history`, config);
                    result.data.sort((a, b) => {
                        return new Date(b.transaction_date) - new Date(a.transaction_date);
                    });
                    setData(result.data);
                    if (result.data.length > 0) {
                        setIsData(true);
                    }
                    setLoading(false);
                }
                catch (error) {
                    setLoading(false);
                    console.error(error.message);
                }
            }
            fetchData();
        }, [])
    )

    const renderItem = ({ item }) => {
        return (
            <View style={styles.row}>
                <Text style={styles.cell}>{formatTimestampToTimeDate(item.transaction_date)}</Text>
                <Text style={styles.cell}>{item.prediction_number}</Text>
                <Text style={styles.cell}>{item.winning_number || 'N/A'}</Text>
            </View>
        );
    };


    return (
        <>
            <Text style={styles.text1}>Your Prediction History</Text>
            <View style={styles.table}>
                <View style={styles.row}>
                    <Text style={styles.headerCell}>Date & Time</Text>
                    <Text style={styles.headerCell}>Prediction Number</Text>
                    <Text style={styles.headerCell}>Winning Number</Text>
                </View>
            </View>
            <ScrollView style={styles.container}>
                {
                    loading ?
                        <>
                            <ActivityIndicator size="large"></ActivityIndicator>
                        </>
                        :
                        <>
                            {
                                isData ?
                                    <FlatList
                                        data={data}
                                        renderItem={renderItem}
                                        keyExtractor={(item) => item._id}
                                    />
                                    :
                                    <>
                                        <Text style={styles.text1}>You have not made any prediction yet.</Text>
                                    </>

                            }
                        </>
                }
            </ScrollView>
            <View style={{ flex: 1, justifyContent: "flex-end" }}>
                <FooterMenu />
            </View>
        </>
    );
};

const styles = EStyleSheet.create({
    container: {
        flex: 5,
    },
    table: {
        borderWidth: 1,
        borderColor: 'black',
        width: '100%',
    },
    row: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: 'black',
        padding: 8,
    },
    cell: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    headerCell: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-around',
        fontWeight: 'bold',
    },
    text1: {
        fontSize: "30rem",
        fontWeight: "bold",
        color: COLORS.black,
        marginTop: 10,
        marginBottom: 10,
        textAlign: "center"
    },
});

export default UserHistory;