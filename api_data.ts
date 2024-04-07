import { Request, Response } from "express";
import axios from "axios";
import dotenv from "dotenv";
import { uploadToDynamoDB } from "./database";

dotenv.config();

const metalPriceKey = process.env.METALPRICE_API_KEY;

export interface MetalPriceResponse {
  success: boolean;
  base: string;
  start_date: string;
  end_date: string;
  rates: { [date: string]: { [currency: string]: number } };
}

// Function to fetch gold prices for a given time interval using Axios
const fetchGoldPricesForInterval = async (
  startDate: Date,
  endDate: Date
): Promise<MetalPriceResponse> => {
  const url = `https://api.metalpriceapi.com/v1/timeframe`;
  const queryParams = {
    api_key: metalPriceKey,
    start_date: startDate.toISOString().split("T")[0],
    end_date: endDate.toISOString().split("T")[0],
    base: "USD",
    currencies: "XAU",
  };

  const queryString = new URLSearchParams(
    queryParams as Record<string, string>
  ).toString();

  const urlWithQuery = `${url}?${queryString}`;
  console.log("Query URL:", urlWithQuery);

  const response = await axios.get(urlWithQuery);
  console.log("Response from server:", response.data);
  return response.data;
};

// Function to fetch gold prices recursively due to 365 days API limit
export const fetchGoldPricesRecursively = async (
  startDate: Date,
  endDate: Date
) => {
  try {
    let allRates: { [date: string]: { [currency: string]: number } } = {};

    // Recursive function to fetch data for each time interval
    const fetchAndProcessData = async (startDate: Date, endDate: Date) => {
      const data = await fetchGoldPricesForInterval(startDate, endDate);
      // Merge rates from this interval into the allRates object
      allRates = { ...allRates, ...data.rates };

      // If the time interval exceeds 365 days, split it into two intervals and recursively fetch data
      const timeDifference = endDate.getTime() - startDate.getTime();
      if (timeDifference > 365 * 24 * 60 * 60 * 1000) {
        const middleDate = new Date(
          startDate.getTime() + 365 * 24 * 60 * 60 * 1000
        );
        await fetchAndProcessData(startDate, middleDate);
        await fetchAndProcessData(middleDate, endDate);
      }
    };

    await fetchAndProcessData(startDate, endDate);

    // After fetching all data, process and return the combined rates
    return allRates;
  } catch (error) {
    console.error("Error fetching gold prices:", error);
    throw error;
  }
};

// Endpoint handler function to fetch and send gold prices to the frontend
export const fetchGoldPricesHandler = async (req: Request, res: Response) => {
  try {
    // Define the initial start and end dates for the last 2 years
    const endDate = new Date(); // Current date
    const startDate = new Date(endDate);
    startDate.setFullYear(endDate.getFullYear() - 2);

    // Fetch the gold prices recursively
    const mergedRates = await fetchGoldPricesRecursively(startDate, endDate);

    await uploadToDynamoDB(mergedRates);

    // Send the merged rates back to the frontend
    res.status(200).json(mergedRates);
  } catch (error) {
    console.error("Error fetching gold prices:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
