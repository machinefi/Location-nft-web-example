import BigNumber from "bignumber.js";
import { ethers, utils } from "ethers";
import { pebble } from "../db";
import _ from 'lodash'

export const getSignDataForLocation = async ({
  owner,
  locations,
}: {
  owner: string;
  locations: Array<{
    scaled_latitude: number;
    scaled_longitude: number;
    distance: number;
    from: number;
    to: number;
  }>;
}) => {
  const records = await pebble.begin((pebblePg) =>
    locations.map((location) => {
      const from = new BigNumber(location.from).toNumber();
      const to = new BigNumber(location.to).toNumber();
      const distance = new BigNumber(location.distance).toNumber();
      const latitude = Number(new BigNumber(location.scaled_latitude).div(1e6).toFixed(6));
      const longitude = Number(new BigNumber(location.scaled_longitude).div(1e6).toFixed(6));
      return pebblePg<
        {
          imei: string;
          latitude: number;
          longitude: number;
          from: string;
          to: string;
          distance: number;
        }[]
      >`
        SELECT DISTINCT ON (imei) imei,
          ${latitude} as latitude,
          ${longitude} as longitude,
          ${from} as from,
          ${to} as to,
          ${distance} as distance
        FROM (
          SELECT dr.imei, st_distancesphere(
            st_makepoint((dr.data ->> 'longitude')::NUMERIC, (dr.data ->> 'latitude')::NUMERIC), 
            st_makepoint(${longitude}::NUMERIC, ${latitude}::NUMERIC)
          ) as distance
          FROM
            web3stream.device_record dr
          LEFT JOIN web3stream.device d
          ON dr.imei=d.id
          WHERE d.owner ilike ${owner} AND to_timestamp(dr.timestamp) BETWEEN to_timestamp(${from}) AND to_timestamp(${to})
          ORDER BY dr.imei, dr."timestamp"
        ) dd
        WHERE dd.distance < ${distance}`;
    })
  );
  const cache = {};
  return Promise.all(
    _.flatten(records.filter((i) => i.length))
      .filter((record: { imei: string; latitude: number; longitude: number; from: string; to: string; distance: number }) => {
        if (!cache[record.imei]) {
          cache[record.imei] = true;
          return true;
        }
      })
      .map(async (record: { imei: string; latitude: number; longitude: number; from: string; to: string; distance: number }) => {
        const { imei, from, to } = record;
        const latitude = Number(record.latitude) * 1e6;
        const longitude = Number(record.longitude) * 1e6;
        const distance = Math.round(record.distance);
        const devicehash = utils.keccak256(utils.toUtf8Bytes(imei));
        // delete record.imei;
        const signHash = utils.solidityKeccak256(["address", "int256", "int256", "uint256", "bytes32", "uint256", "uint256"], [owner, latitude, longitude, distance, devicehash, from, to]);
        const messageHashBinary = utils.arrayify(signHash);
        const signature = await new ethers.Wallet(process.env.META_HOST_PRIVATEKEY!).signMessage(messageHashBinary);
        console.log("sign", process.env.META_HOST_PRIVATEKEY, signHash, owner, latitude, longitude, distance, devicehash, messageHashBinary, signature);
        return {
          scaled_latitude: latitude,
          scaled_longitude: longitude,
          distance,
          from: Number(from),
          to: Number(to),
          signature,
          devicehash,
          imei,
        };
      })
  );
};
