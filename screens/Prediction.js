import { View, Text, TextInput, TouchableOpacity, Linking, Image, FlatList, Dimensions, Alert, Share, KeyboardAvoidingView, ActivityIndicator } from 'react-native';
import React, { useContext, useState, useEffect } from 'react';
import COLORS from "../constants/colors";
import { SafeAreaView } from 'react-native-safe-area-context';
import EStyleSheet from 'react-native-extended-stylesheet';
import { BASE_API_URL } from '../constants/baseApiUrl';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { AuthContext } from '../context/authContext';
import { formatTimestampToTimeDate, ordinalDateFormat } from '../constants/dataTime';
import FooterMenu from '../components/Menus/FooterMenu';
import Modal from 'react-native-modal';
import { openYouTubeLink } from '../constants/openYouTubeLink';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { InterstitialAd, useInterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';
import { PredictionContext } from '../context/predictionContext';

let entireScreenWidth = Dimensions.get('window').width;

EStyleSheet.build({ $rem: entireScreenWidth / 380 });


const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-6067634275916377/4705877289';

const Prediction = ({ navigation }) => {
    const { isPredicted, setisPredicted } = useContext(PredictionContext);
    const [predictionNumber, setPredictionNumber] = useState("");
    const [predictionData, setPredictionData] = useState([]);
    const [yesterdayPredictionNumber, setYesterdayPredictionNumber] = useState();
    const [yesterdayWinningNumber, setYesterdayWinningNumber] = useState();
    const [yesterdayWinningURL, setYesterdayWinningURL] = useState("");
    const [todayPredictionNumber, setTodayPredictionNumber] = useState(null);
    // const [isBefore830PM, setIsBefore830PM] = useState(false);
    const [addPrediction, setAddPrediction] = useState(false);
    const [wantEdit, setWantEdit] = useState(false);
    const [id, setId] = useState("");
    const { predictions, setPredictions } = useContext(PredictionContext);
    const [isloading, setIsLoading] = useState(false);
    const { announced, setAnnounced } = useContext(PredictionContext);

    const { state } = useContext(AuthContext);
    const [isModalVisible, setModalVisible] = useState(false);

    const { tempPredictions, setTempPredictions } = useContext(PredictionContext);
    const { addedPredictions, setAddedPredictions } = useContext(PredictionContext);
    const { editedPredictions, setEditedPredictions } = useContext(PredictionContext);
    // const [isAdsModalVisible, setIsAdsModalVisible] = useState(false);

    // const toggleAdsModal = () => {
    //     setIsAdsModalVisible(!isAdsModalVisible);
    // }

    const { isLoaded, isClosed, load, show } = useInterstitialAd(adUnitId, {
        requestNonPersonalizedAdsOnly: true,
        keywords: ['fashion', 'clothing'],
    });

    useFocusEffect(
        React.useCallback(() => {
            if (!isLoaded) {
                load();
            }
        }, [load, isLoaded])
    );


    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };

    useFocusEffect(
        React.useCallback(() => {
            const token = state?.token;
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            async function fetchData() {
                await axios.get(`${BASE_API_URL}api/winning/user/prediction_number`, config).then((res) => {
                    const data = res.data;
                    // const currentDate = new Date().toISOString().split('T')[0];
                    let currentDate = "";
                    if (announced) {
                        const tomorrow = new Date();
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        currentDate = tomorrow.toISOString().split('T')[0];
                    } else {
                        currentDate = new Date().toISOString().split('T')[0];
                    }

                    // Calculate yesterday's date by subtracting one day from the current date
                    // const yesterdayDate = new Date();
                    // yesterdayDate.setDate(yesterdayDate.getDate() - 1);
                    // const formattedYesterdayDate = yesterdayDate.toISOString().split('T')[0];
                    let formattedYesterdayDate = "";
                    if (announced) {
                        const today = new Date();
                        formattedYesterdayDate = today.toISOString().split('T')[0];
                    } else {
                        const yesterdayDate = new Date();
                        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
                        formattedYesterdayDate = yesterdayDate.toISOString().split('T')[0];
                    }

                    let lastUpdatedPredictionNumber = null;

                    // Iterate through the data to find the prediction_numbers
                    data.forEach((item) => {
                        if (item.transaction_date.startsWith(currentDate)) {
                            setisPredicted(true);
                            if (lastUpdatedPredictionNumber === null || item.updatedAt > lastUpdatedPredictionNumber.updatedAt) {
                                lastUpdatedPredictionNumber = item;
                                setTodayPredictionNumber(item.prediction_number);
                            }
                        } else if (item.transaction_date.startsWith(formattedYesterdayDate)) {
                            setYesterdayPredictionNumber(item.prediction_number);
                        }
                    });

                }).catch((err) => {
                    console.log('====================================');
                    console.log(err.response.data.message);
                    console.log('====================================');
                });

                await axios.get(`${BASE_API_URL}api/winning/winning_numbers`)
                    .then(res => {
                        const currentDate = new Date();

                        // Subtract one day to get yesterday's date
                        const yesterdayDate = new Date(currentDate);
                        yesterdayDate.setDate(currentDate.getDate() - 1);

                        // Convert both dates to strings and extract only the date part
                        // const currentDateStr = currentDate.toISOString().slice(0, 10);
                        const yesterdayDateStr = yesterdayDate.toISOString().slice(0, 10);

                        for (const item of res.data) {
                            if (item.created_date_time.startsWith(yesterdayDateStr)) {
                                setYesterdayWinningNumber(item.winning_number);
                                setYesterdayWinningURL(item.youtube_url);
                                break; // Stop once you find the winning number for yesterday
                            }
                        }
                    })
                    .catch(err => {
                        Alert.alert(err);
                    });
            }
            fetchData();


            // function checkTime() {
            //     const currentDate = new Date();
            //     const currentHour = currentDate.getHours();
            //     const currentMinute = currentDate.getMinutes();

            //     // Compare with 20 (8 PM) and 30 (8:30 PM)
            //     setIsBefore830PM(currentHour < 20 || (currentHour === 20 && currentMinute < 30));
            // }

            // // Call the checkTime function when the component mounts
            // checkTime();

            // // Update the time check every minute
            // const intervalId = setInterval(checkTime, 60000);

            // Cleanup the timer when the component unmounts
            // return () => {
            //     clearInterval(intervalId);
            // }
        }, [])
    )

    useEffect(() => {
        // Fetch your data asynchronously and update the state
        const token = state?.token;
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
        const fetchData = async () => {
            try {
                // Replace this with your actual data fetching logic
                const result = await axios.get(`${BASE_API_URL}api/winning/user/user_history`, config)
                const sortedData = await result.data.sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date));
                let day = "";
                if (announced) {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    day = tomorrow.toISOString().split('T')[0];
                } else {
                    day = new Date().toISOString().split('T')[0];
                }
                const todayDocuments = sortedData.filter(item => item.transaction_date.startsWith(day));
                // Extract the last three updated prediction_number and created_date_time
                const lastThreePredictions = todayDocuments.map(item => ({
                    prediction_number: item.prediction_number,
                    transaction_date: item.transaction_date,
                    _id: item._id
                }));

                // Table data
                const tableData = lastThreePredictions.map(prediction => [
                    prediction.prediction_number,
                    formatTimestampToTimeDate(prediction.transaction_date),
                    prediction._id
                ]);

                setPredictionData(lastThreePredictions);

            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [predictionData]); // Empty dependency array ensures the effect runs only once on mount


    function handleAddPrediction() {
        setWantEdit(false);
        setPredictionNumber("");
        setAddPrediction(true);
        setisPredicted(false);
    }
    function handleWantEdit(id) {
        setWantEdit(true);
        setPredictionNumber("");
        setAddPrediction(false);
        setId(id);
        setisPredicted(false);
    }

    const submitPrediction = async () => {
        load();
        setIsLoading(true);
        const token = state?.token;

        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };

        try {
            if (predictionNumber && predictionNumber.length == 5) {
                if (addPrediction) {
                    await axios.post(`${BASE_API_URL}api/winning/user/prediction_number`, { predictionNumber, announced }, config);
                    // let tempPredictionsData = await AsyncStorage.getItem('tempPredictions');
                    // tempPredictionsData = parseFloat(tempPredictionsData);
                    if (tempPredictions > 0) {
                        await axios.post(`${BASE_API_URL}api/user/predictions`, { predictions: 0, tempPredictions: -1, addedPredictions: 1, editedPredictions: 0, adsViewed: 0 }, config).then((res) => {
                            setPredictions(res.data.predictions);
                            setTempPredictions(res.data.tempPredictions);
                            setAddedPredictions(res.data.addedPredictions);
                        })
                        // tempPredictionsData = tempPredictionsData - 1;
                        // setTempPredictions(tempPredictionsData);
                        // tempPredictionsData = tempPredictionsData.toString();
                        // await AsyncStorage.setItem('tempPredictions', tempPredictionsData);
                    } else {
                        await axios.post(`${BASE_API_URL}api/user/predictions`, { predictions: -1, tempPredictions: 0, addedPredictions: 1, editedPredictions: 0, adsViewed: 0 }, config).then((res) => {
                            setPredictions(res.data.predictions);
                            setTempPredictions(res.data.tempPredictions);
                            setAddedPredictions(res.data.addedPredictions);
                            setEditedPredictions(res.data.editedPredictions);
                        })
                        // const decrementValue = 1;
                        // await axios.post(`${BASE_API_URL}api/user/edit_count`, { decrementValue }, config);
                        // const updatedEditCount = await axios.get(`${BASE_API_URL}api/user/edit_count`, config);
                        // setEditCount(updatedEditCount.data.editCount);
                    }
                    // let addedPredictionsData = await AsyncStorage.getItem('addedPredictions');
                    // addedPredictionsData = parseFloat(addedPredictionsData);
                    // addedPredictionsData = addedPredictionsData + 1;
                    // setAddedPredictions(addedPredictionsData);
                    // addedPredictionsData = addedPredictionsData.toString();
                    // await AsyncStorage.setItem('addedPredictions', addedPredictionsData);
                    setIsLoading(false);
                } else if (wantEdit) {
                    await axios.put(`${BASE_API_URL}api/winning/user/prediction_number`, { predictionNumber, id }, config);
                    await axios.post(`${BASE_API_URL}api/user/predictions`, { predictions: 0, tempPredictions: 0, addedPredictions: 0, editedPredictions: 1, adsViewed: 0 }, config).then((res) => {
                        setPredictions(res.data.predictions);
                        setTempPredictions(res.data.tempPredictions);
                        setAddedPredictions(res.data.addedPredictions);
                        setEditedPredictions(res.data.editedPredictions);
                    })
                    // let editedPredictionsData = await AsyncStorage.getItem('editedPredictions');
                    // editedPredictionsData = parseFloat(editedPredictionsData);
                    // editedPredictionsData = editedPredictionsData + 1;
                    // await setEditedPredictions(editedPredictionsData);
                    // editedPredictionsData = editedPredictionsData.toString();
                    // await AsyncStorage.setItem('editedPredictions', editedPredictionsData);
                    setIsLoading(false);
                }
                else {
                    await axios.post(`${BASE_API_URL}api/winning/user/prediction_number`, { predictionNumber, announced }, config);
                    // const updatedEditCount = await axios.get(`${BASE_API_URL}api/user/edit_count`, config);
                    // setEditCount(updatedEditCount.data.editCount);
                    // await axios.post(`${BASE_API_URL}api/user/predictions`, { predictions: 0, tempPredictions: 0, addedPredictions: 0, editedPredictions: 0 }, config).then((res) => {
                    //     setPredictions(res.data.predictions);
                    //     setTempPredictions(res.data.tempPredictions);
                    // })
                    setIsLoading(false);
                }
                // toggleAdsModal();
                show();
                toggleModal();

                navigation.navigate("UserHistory");
            }
            else if (!predictionNumber) {
                setIsLoading(false);
                Alert.alert("Please enter your prediction number !")
            }
            else if (predictionNumber.length < 5) {
                setIsLoading(false);
                Alert.alert("Please enter 5 digit number !")
            }

        } catch (error) {
            setIsLoading(false);
            Alert.alert(error.response.data.message);
        }
    }

    const handleShare = async (name) => {
        try {
            const result = await Share.share({
                title: `Tring Tring`,
                message:
                    `https://tring-tring.netlify.app/ \nHey ${name}! , I am using Tring Tring to PREDICT and WIN daily !!!\nJoin by my referral get bonus money and more predictions.`,
            });
            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    // shared with activity type of result.activityType
                    console.log('====================================');
                    console.log("Activity Type", result.activityType);
                    console.log("Activity Type", result.activityType);
                    console.log('====================================');
                } else {
                    // shared
                    console.log('====================================');
                    console.log("Shared");
                    console.log('====================================');
                }
            } else if (result.action === Share.dismissedAction) {
                // dismissed
                console.log('====================================');
                console.log("Dismiseds");
                console.log('====================================');
            }
        } catch (error) {
            Alert.alert(error.message);
        }
    };

    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - 1);

    if (announced) {
        setisPredicted(false);
    }
    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);

    const renderItem = ({ item }) => {
        return (
            <View style={styles.row}>
                <Text style={{ flex: 1, alignItems: 'center', justifyContent: 'center', textAlign: "left" }}>{formatTimestampToTimeDate(item.transaction_date)}</Text>
                <Text style={styles.cell}>{item.prediction_number}</Text>
                <>{
                    editedPredictions === 5 ?
                        <></>
                        :
                        <TouchableOpacity
                            style={styles.editbutton}
                            onPress={() => handleWantEdit(item._id)}
                        >
                            <Text style={{ color: "white", textAlign: "center", fontSize: 16 }}>Edit</Text>
                        </TouchableOpacity>
                }
                </>
            </View>
        );
    };
    return (
        <SafeAreaView style={{ flex: 1, justifyContent: "space-evenly" }}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
                enabled="true"
            >
                <View style={{ flex: 3 }}>
                    {/* {
                        isBefore830PM ? */}
                    <>
                        <View style={{ flex: 1, alignItems: "center" }}>
                            {isPredicted ?
                                <Text
                                    style={styles.text1}
                                >
                                    YOU HAVE ALREADY PREDICTED
                                </Text>
                                :
                                <>
                                    {
                                        addPrediction || wantEdit ?
                                            <Text
                                                style={styles.text1}
                                            >
                                                UPDATE YOUR 5 DIGIT PREDICTION NUMBER
                                            </Text>
                                            :
                                            <Text
                                                style={styles.text1}
                                            >
                                                ENTER YOUR 5 DIGIT PREDICTION NUMBER
                                            </Text>
                                    }
                                </>
                            }

                            <>{
                                announced ?
                                    <Text
                                        style={styles.text2}
                                    >
                                        FOR {ordinalDateFormat(tomorrowDate)}, DRAW @ TOMORROW 9 PM IST
                                    </Text>
                                    :
                                    <Text
                                        style={styles.text2}
                                    >
                                        FOR {ordinalDateFormat(new Date())}, DRAW @ 9 PM IST
                                    </Text>
                            }
                            </>
                        </View>
                        <View style={{ flex: 2, alignItems: "center" }}>

                            {isPredicted ?
                                <>
                                    <Text style={styles.text1}>
                                        Your Prediction Number is <Text style={{ color: "green" }}>{todayPredictionNumber}</Text>
                                    </Text>
                                    {
                                        (predictions + tempPredictions) <= 0 ?
                                            <>
                                                <Text style={styles.text1}><Text style={{ color: "red" }}>You have no predictions! Watch video to get predictions.</Text></Text>
                                            </>
                                            :
                                            <>
                                                {addedPredictions > 5 ?
                                                    <Text style={styles.text1}><Text style={{ color: "red" }}>You have reached the limit to predict the number for today.</Text></Text>
                                                    :
                                                    <>
                                                        <Text style={styles.text2}>Want to add more prediction </Text>
                                                        {/* <Text style={styles.text2}><Text style={{ color: "#F8DE22" }}>{editCount} more chances </Text> </Text> */}
                                                        <TouchableOpacity
                                                            style={styles.button}
                                                            onPress={handleAddPrediction}
                                                        >
                                                            <Text style={{ color: "white", textAlign: "center", fontSize: 22 }}>Add another</Text>
                                                        </TouchableOpacity>
                                                    </>
                                                }
                                            </>
                                    }
                                </>
                                :
                                <>
                                    <TextInput
                                        style={styles.textInput}
                                        maxLength={5}
                                        autoFocus={true}
                                        keyboardType='numeric'
                                        placeholder=' - - - - -'
                                        value={predictionNumber}
                                        onChangeText={(text) => setPredictionNumber(text)}
                                    >
                                    </TextInput>
                                    <Text style={{ marginTop: -5, fontWeight: "bold", color: "green" }}>terms & conditions apply*</Text>
                                    {
                                        isloading ? <ActivityIndicator></ActivityIndicator> :
                                            <TouchableOpacity
                                                style={styles.button}
                                                onPress={submitPrediction}
                                            >
                                                <Text style={{ color: "white", textAlign: "center", fontSize: 22 }}>Submit</Text>
                                            </TouchableOpacity>
                                    }
                                    {/* <Modal
                                                isVisible={isAdsModalVisible}
                                                style={styles.modal}
                                                animationIn="slideInUp"
                                                animationOut="slideOutDown"
                                            >
                                                <View style={styles.modalContent}>
                                                    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "grey" }}>
                                                        <Text style={styles.text1}>ADS VIEW</Text>
                                                    </View>
                                                    <TouchableOpacity onPress={toggleAdsModal}>
                                                        <Text style={styles.closeButton}>Hide Popup</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </Modal> */}
                                    <Modal
                                        isVisible={isModalVisible}
                                        style={styles.modal}
                                        animationIn="slideInUp"
                                        animationOut="slideOutDown"
                                    >
                                        <View style={styles.modalContent}>
                                            <Text style={styles.text1}>Your prediction has been submitted successfully.</Text>
                                            <Text style={styles.text1}>
                                                Your Prediction Number is <Text style={{ color: "green" }}>{predictionNumber}</Text>
                                            </Text>
                                            <Text style={styles.text1}>Watch a video to get another prediction or share it with friends and family and get more predictions</Text>
                                            <TouchableOpacity
                                                style={styles.shareButton}
                                            // onPress={() => toggleAdsModal()}
                                            >
                                                <Image style={{ height: 60, width: 60, }} source={require("../assets/utubelogo.png")}></Image>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={styles.shareButton}
                                                onPress={() => handleShare()}
                                            >
                                                <Text style={styles.shareButtonText}>Share</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={toggleModal}>
                                                <Text style={styles.closeButton}>Hide Popup</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </Modal>
                                </>
                            }
                        </View>
                    </>
                    {/* :
                            <>
                                <View style={{ flex: 2, alignItems: "center" }}>
                                    <Text style={{ fontSize: 30, color: "red", textAlign: "center" }}>All entries are closed for today. You can come back and predict for tomorrow after 12 Midnight.</Text>
                                    <Text style={styles.text1}>
                                        Your Prediction Number is <Text style={{ color: "green" }}>{todayPredictionNumber}</Text>
                                    </Text>
                                </View>
                            </>
                    } */}
                </View>
                <View style={{ flex: 2 }}>
                    <Text style={styles.text1}>My Predictions</Text>
                    <View style={{ borderBottomWidth: 2 }}></View>
                    {
                        editedPredictions === 5 ?
                            <Text style={styles.text1}><Text style={{ color: "red" }}>You have reached limit to edit predictions!</Text></Text>
                            :
                            <></>
                    }
                    <FlatList
                        data={predictionData}
                        renderItem={renderItem}
                        keyExtractor={(item) => item._id}
                    />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.text1}>Yesterday Winning Number</Text>
                    <View style={{ flexDirection: "row", backgroundColor: "#00BF63", alignItems: "center", justifyContent: "space-around", borderRadius: 50 }}>
                        <Text style={styles.winning_number}>{yesterdayWinningNumber || "N/A"}</Text>
                        <TouchableOpacity onPress={() => openYouTubeLink(yesterdayWinningURL)}>
                            <Image
                                source={require("../assets/utubelogo.png")}
                                style={{
                                    height: 60,
                                    width: 60,
                                }}
                            >
                            </Image>
                        </TouchableOpacity>
                        <View>
                            <Text style={styles.text2}>Your Prediction</Text>
                            <Text style={styles.winning_number}>{yesterdayPredictionNumber || "N/A"}</Text>
                        </View>
                    </View>
                </View>
                <View style={{ flex: 1, justifyContent: "flex-end" }}>
                    <FooterMenu />
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView >
    )
}


const styles = EStyleSheet.create({
    text1: {
        fontSize: "21rem",
        fontWeight: "bold",
        color: COLORS.black,
        textAlign: "center",
    },
    text2: {
        fontSize: "15rem",
        fontWeight: "bold",
        color: COLORS.black,
        textAlign: "center"
    },
    winning_number: {
        fontSize: "25rem",
        fontWeight: "bold",
        color: COLORS.white,
        padding: "7rem",
        textAlign: "center",
    },
    text3: {
        fontSize: "30rem",
        fontWeight: "bold",
        color: COLORS.black,
        textAlign: "center"
    },
    button: {
        margin: 10,
        backgroundColor: "green",
        borderRadius: 15,
        padding: 10,
    },
    editbutton: {
        backgroundColor: "green",
        borderRadius: 15,
        margin: 10,
        paddingHorizontal: 10
    },
    container: {
        flex: 1, flexDirection: "column", justifyContent: "space-around", backgroundColor: COLORS.white
    },
    textInput: {
        color: "green", fontSize: "36rem", borderWidth: 2, marginVertical: 10, paddingHorizontal: 10, width: "150rem", borderRadius: 15, borderColor: "green",
        textAlign: "center",
    },
    head: { height: 40, backgroundColor: '#808B97' },
    text: { margin: 6 },
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
        textAlign: "center",
    },
    headerCell: {
        flex: 1,
        justifyContent: 'center',
        fontWeight: 'bold',
        textAlign: "center"
    },
    modal: {
        justifyContent: 'flex-end',
        margin: 0,
    },
    modalContent: {
        backgroundColor: 'green', // Background color of the modal
        padding: 16,
        alignItems: 'center',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    modalText: {
        color: 'white', // Text color
        fontSize: 18,
        marginBottom: 10,
    },
    closeButton: {
        color: 'red', // Close button text color
        fontSize: 16,
        fontWeight: 'bold',
    },
    shareButton: {
        backgroundColor: '#4caf50',
        padding: 8,
        borderRadius: 50,
        marginLeft: 10,
    },
    shareButtonText: {
        color: '#fff',
    },
});

export default Prediction;