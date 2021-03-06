import { useEffect, useState, useContext } from 'react';
import { UserContext } from 'context';
import { Stack, Grid, Typography, Grow  } from '@mui/material';
import Colors from 'assets/colors';
import { Box } from '@mui/material';
import socketio from 'socket.io-client';
import coin from 'assets/images/coin.png';
import { useQuery, useQueryClient } from 'react-query';
import { transactionLog } from 'apis';

const ENDPOINT = 'http://192.168.0.96:5000'

const FunnyStack = ({ children, sx, ...props }) => (
    <Stack sx={{ p: 2, borderRadius: 2, border: 5, background: 'white', ...sx }} {...props}>
        {children}
    </Stack>
)

const Transaction = ({ sender, receiver, amount, time }) => {
    return (
        <>
            <Stack direction="row" alignItems="center" justifyContent="space-around">
                <Typography variant="h1">
                    {`User ${sender}`}
                </Typography>
                <Typography variant="h1">
                    {`User ${receiver}`}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="h1">
                        {amount}
                    </Typography>
                    <Box sx={{ width: 35, height: 35, backgroundImage: `url(${coin})`, backgroundSize: 'cover' }}/>
                </Stack>
                <Stack spacing={1} alignItems="center">
                    <Typography variant="h1" sx={{ fontSize: '1rem' }}>
                        {time?.date}
                    </Typography>
                    <Typography variant="h1" sx={{ fontSize: '1rem' }}>
                        {time?.hours}
                    </Typography>
                </Stack>
            </Stack>
            <Box sx={{ border: `2px dashed black` }}/>
        </>
    );
};

const formatDate = (date) => {
    if (date === undefined) {
        return {
            date: '',
            hours: ''
        }
    }
    console.log('date', date);
    const hours = (date.getHours() < 10) ? `0${date.getHours()}` : date.getHours();
    const minutes = (date.getMinutes() < 10) ? `0${date.getMinutes()}` : date.getMinutes();
    const day = (date.getDate() < 10) ? `0${date.getDate()}` : date.getDate();
    const month = (date.getMonth() + 1 < 10) ? `0${date.getMonth()+1}` : date.getMonth()+1;
    const year = date.getFullYear();
    return {
        date: `${day}/${month}`,
        hours: `${hours}:${minutes}`
    }
}

const format = (data, transaction) => {
    console.log('data', data);
    if (!data) {
        return {};
    }
    const sender = data.find((item) => item.address === transaction["sender_address"]).id;
    const receiver = data.find((item) => item.address === transaction["receiver_address"]).id;
    const date = new Date(transaction?.timestamp * 1000);
    return {
        sender,
        receiver,
        amount: transaction.amount,
        time: formatDate(date)
    };
}

const Transactions = () => {
    const [ listTransactions, setListTransactions ] = useState([]);
    const { ringQuery, myIP } = useContext(UserContext);
    const queryClient = useQueryClient();

    useEffect(() => {
        const fetchData = async () => {
            try {
                let latestTransactions = await transactionLog();
                console.log('data', latestTransactions);
                latestTransactions = latestTransactions.map((trx) => format(ringQuery.data, trx))
                console.log('data', latestTransactions);
                setListTransactions(latestTransactions);
            } catch (error) {
                console.error('error', error);
            }
        }
        fetchData();
        const socket = socketio(ENDPOINT);
        socket.on("new_transaction", (newTransaction) => {
            queryClient.invalidateQueries('balance');
            setListTransactions(prev => ([format(ringQuery.data, newTransaction), ...prev]));
        });
    }, []);

    return (
        <Grid container spacing={2} sx={{ p: 2 }}>
            <Grid item xs={12}>
                <FunnyStack sx={{ background: Colors.yellowLight }}>
                    <Typography variant="h1" sx={{ color: Colors.yellow }}>
                                Transactions Log
                    </Typography>
                </FunnyStack>
            </Grid>
            <Grid item xs={12}>
                <Box sx={{ border: '4px dashed white' }}/>
            </Grid>
            <Grow in={true} timeout={1000}>
                <Grid item xs={12}>
                    <Stack direction="row" justifyContent="space-around">
                        <Typography variant="h1">
                            Sender
                        </Typography>
                        <Typography variant="h1">
                            Receiver
                        </Typography>
                        <Typography variant="h1">
                            Amount
                        </Typography>
                        <Typography variant="h1">
                            Time
                        </Typography>
                    </Stack>
                    <Box sx={{ p: 2, borderRadius: 2, height: 400, background: 'white', border: 5, overflowY: 'scroll' }}>
                        <Stack spacing={1}>
                            {listTransactions.map((transaction, key) => 
                                <Transaction 
                                    key={key}
                                    sender={transaction?.sender}
                                    receiver={transaction?.receiver}
                                    amount={transaction?.amount}
                                    time={transaction?.time}
                                />)}
                        </Stack>
                    </Box>
                </Grid>
            </Grow>
            <Grid item xs={12}>
                <Box sx={{ border: '4px dashed white' }}/>
            </Grid>
        </Grid>
    );
}

export default Transactions;