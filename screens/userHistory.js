import { View, Text, Dimensions, FlatList, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import React, { useContext, useState } from 'react';
import COLORS from "../constants/colors";
import EStyleSheet from 'react-native-extended-stylesheet';
import { BASE_API_URL } from '../constants/baseApiUrl';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { AuthContext } from '../context/authContext';
import FooterMenu from '../components/Menus/FooterMenu';
import { formatDateToDDMMYYYY, formatTimestampToTimeDate } from '../constants/dataTime';
import { openYouTubeLink } from '../constants/openYouTubeLink';
import { PredictionContext } from '../context/predictionContext';
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
                        return new Date(b.created_date_time) - new Date(a.created_date_time);
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

    // const MemoizedHistoryItem = React.memo(({ item, openYouTubeLink }) => {
    //     return (
    //         <View style={styles.row}>
    //             <Text style={{ flex: 1, alignItems: 'center', justifyContent: 'center', textAlign: "left" }}>{formatTimestampToTimeDate(item.transaction_date)}</Text>
    //             <Text style={styles.cell}>{item.prediction_number}</Text>
    //             <Text style={{ flex: 1, alignItems: 'center', alignSelf: "center", justifyContent: 'center', textAlign: "center" }}>{item.winning_number || 'N/A'}</Text>
    //             <TouchableOpacity onPress={() => openYouTubeLink(item.youtube_url)}>
    //                 <Image
    //                     source={require("../assets/utubelogo.png")}
    //                     style={{
    //                         height: 40,
    //                         width: 40,
    //                     }}
    //                 >
    //                 </Image>
    //             </TouchableOpacity>
    //         </View>
    //     );
    // });

    const renderItem = ({ item }) => {
        return (
            <View style={styles.row}>
                <Text style={{ flex: 1, alignItems: 'center', alignSelf: "center", justifyContent: 'center', textAlign: "left" }}>{formatTimestampToTimeDate(item.created_date_time)}</Text>
                {/* {announced
                    ?
                    <Text style={{ flex: 1, alignItems: 'center', alignSelf: "center", justifyContent: 'center', textAlign: "left" }}>{tomorrowDate}</Text>
                    : */}
                <Text style={{ flex: 1, alignItems: 'center', alignSelf: "center", justifyContent: 'center', textAlign: "left" }}>{formatDateToDDMMYYYY(item.transaction_date)}</Text>
                {/* } */}
                <Text style={styles.cell}>{item.prediction_number}</Text>
                <Text style={{ flex: 1, alignItems: 'center', alignSelf: "center", justifyContent: 'center', textAlign: "left" }}>{item.winning_number || 'N/A'}</Text>
                <TouchableOpacity onPress={() => openYouTubeLink(item.youtube_url)}>
                    <Image
                        source={require("../assets/utubelogo.png")}
                        style={{
                            height: 40,
                            width: 40,
                        }}
                    >
                    </Image>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <>
            <Text style={styles.text1}>History</Text>
            <View style={styles.table}>
                <View style={styles.row}>
                    <Text style={{ flex: 1, alignItems: 'center', fontWeight: 'bold', justifyContent: 'center', textAlign: "left" }}>Created On</Text>

                    <Text style={styles.headerCell}>Your Number</Text>
                    <Text style={styles.headerCell}>Winning Number Info</Text>

                </View>
            </View>
            <View style={styles.container}>
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
            </View>
            <View style={{ flex: 1, justifyContent: "flex-end" }}>
                <FooterMenu />
            </View>
        </>
    );
};

const styles = EStyleSheet.create({
    container: {
        flex: 6,
        justifyContent: "center",
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
        alignSelf: "center",
        justifyContent: 'center',
        textAlign: "left",
    },
    headerCell: {
        flex: 1,
        justifyContent: 'center',
        fontWeight: 'bold',
        textAlign: "center"
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