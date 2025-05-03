import axios from "axios"
export const sendAnalytics = async (name, type, amount) => {
    if(name.includes('^')){
        return
    }
    const analyticsResponse = await axios.post(`${process.env.REACT_APP_API_URL}/api/analytics`, {
        name,
        type,
        amount
    })
    return analyticsResponse.data
}
export const getAnalytics = async () => {
    const analyticsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/analytics`)
    return analyticsResponse.data
}