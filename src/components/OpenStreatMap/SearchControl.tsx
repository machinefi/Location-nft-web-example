import { useEffect } from "react";
import { useMap } from "react-leaflet";
// @ts-ignore
import { GeoSearchControl } from "leaflet-geosearch";
import L from "leaflet";

const SearchControl = props => {
  const map = useMap();

  useEffect(() => {
    const searchControl = new GeoSearchControl({
      provider: props.provider,
      ...props,
    });

    map.addControl(searchControl);
    return () => map.removeControl(searchControl);
  }, [props]);

  return null;
};
export default SearchControl;
