import React, { Component } from "react";
import ReactMapGL, { Layer, Source } from "react-map-gl";
import { concave, polygon, multiPoint, featureCollection } from "@turf/turf";
import * as turf from "@turf/turf";
import data from "./us-states.json";

const accessToken =
  "pk.eyJ1IjoiYWJkdWwwOTU3IiwiYSI6ImNraG9tYjJueTAzNXQyeXRrNzh4NDBlbmcifQ.3CQ0p_HBVavofv5TaASzvA";

class Map extends Component<{}> {
  state = {
    feature: {},
    stateHovered: null,
    viewport: {
      width: 400,
      height: 400,
      latitude: 37.7577,
      longitude: -122.4376,
      zoom: 4,
    },
  };

  _onHover = (event: any) => {
    let stateHovered: any = null;
    const latLn = event.lngLat;
    let hoveredPoint: any = {
      type: "Feature",
      properties: {
        "marker-color": "#0f0",
      },
      geometry: {
        type: "Point",
        coordinates: latLn,
      },
    };
    for (let i of data.features) {
      let statePoint: any = i.geometry;
      var isInside = turf.inside(hoveredPoint, statePoint);
      if (isInside) {
        stateHovered = {
          type: "FeatureCollection",
          features: [i],
        };
        this.setState({ stateHovered: stateHovered });
      } else {
      }
    }
  };

  render() {
    const stateHovered: any = this.state.stateHovered;
    const alStates: any = data;

    return (
      <ReactMapGL
        {...this.state.viewport}
        width="100%"
        height="100vh"
        mapStyle="mapbox://styles/mapbox/dark-v9"
        mapboxApiAccessToken={accessToken}
        onViewportChange={(viewport) => this.setState({ viewport })}
        onHover={this._onHover}
      >
        <Source id="my-data" type="geojson" data={alStates}>
          <Layer
            id="point"
            type="line"
            paint={{
              "line-color": "#877b59",
              "line-width": 1,
            }}
          />
        </Source>
        <Source id="fill" type="geojson" data={stateHovered}>
          {stateHovered && (
            <Layer
              id="fill"
              type="fill"
              paint={{
                "fill-color": ["get", "fill"],
                "fill-opacity": ["get", "stroke-opacity"],
              }}
            />
          )}
        </Source>
      </ReactMapGL>
    );
  }
}
export default Map;
