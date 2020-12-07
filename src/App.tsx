import React, { Component } from "react";
import ReactMapGL, {
  Layer,
  Source,
  Popup,
  LinearInterpolator,
  WebMercatorViewport,
} from "react-map-gl";
import { concave, polygon, multiPoint, featureCollection } from "@turf/turf";
import bbox from "@turf/bbox";
import * as turf from "@turf/turf";
import data from "./us-states.json";
import {
  Editor,
  EditingMode,
  DrawLineStringMode,
  DrawPolygonMode,
} from "react-map-gl-draw";

const accessToken =
  "pk.eyJ1IjoiYWJkdWwwOTU3IiwiYSI6ImNraG9tYjJueTAzNXQyeXRrNzh4NDBlbmcifQ.3CQ0p_HBVavofv5TaASzvA";
const MODES = [
  { id: "drawPolyline", text: "Draw Polyline", handler: DrawLineStringMode },
  { id: "drawPolygon", text: "Draw Polygon", handler: DrawPolygonMode },
  { id: "editing", text: "Edit Feature", handler: EditingMode },
];

class Map extends Component<{}> {
  state = {
    feature: {},
    modeId: null,
    modeHandler: null,
    stateHovered: null,
    editData: [],
    showpopup: null,
    viewport: {
      width: 400,
      height: 400,
      latitude: 37.7577,
      longitude: -122.4376,
      zoom: 4,
    },
  };
  mapRef: any = React.createRef();

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
    const editData: any[] = this.state.editData;

    try {
      for (let i of editData) {
        let statePoint: any = i.geometry;
        var isInside = turf.inside(hoveredPoint, statePoint);
        if (isInside) {
          stateHovered = {
            type: "FeatureCollection",
            features: [i],
          };
          if (stateHovered.features[0].geometry.coordinates[0].length > 1) {
            let polygon = turf.polygon([
              stateHovered.features[0].geometry.coordinates[0],
            ]);
            let pointOnPolygon = turf.pointOnFeature(polygon);
            // this.setState({ showpopup: pointOnPolygon });
          } else {
            let polygon = turf.polygon(
              stateHovered.features[0].geometry.coordinates[0]
            );
            let pointOnPolygon = turf.pointOnFeature(polygon);
            // this.setState({ showpopup: pointOnPolygon });
          }
          this.setState({ stateHovered: stateHovered });
        } else {
        }
      }
    } catch (err) {
      console.log(err, editData);
    }

    for (let i of data.features) {
      let statePoint: any = i.geometry;
      var isInside = turf.inside(hoveredPoint, statePoint);
      if (isInside) {
        stateHovered = {
          type: "FeatureCollection",
          features: [i],
        };
        if (stateHovered.features[0].geometry.coordinates[0].length > 1) {
          let polygon = turf.polygon([
            stateHovered.features[0].geometry.coordinates[0],
          ]);
          let pointOnPolygon = turf.pointOnFeature(polygon);
          // this.setState({ showpopup: pointOnPolygon });
        } else {
          let polygon = turf.polygon(
            stateHovered.features[0].geometry.coordinates[0]
          );
          let pointOnPolygon = turf.pointOnFeature(polygon);
          // this.setState({ showpopup: pointOnPolygon });
        }
        this.setState({ stateHovered: stateHovered });
      } else {
      }
    }
  };

  _onClick = (event: any) => {
    const feature = event.features[0];
    if (feature) {
      // calculate the bounding box of the feature
      const [minLng, minLat, maxLng, maxLat] = bbox(feature);
      // construct a viewport instance from the current state
      const viewport = new WebMercatorViewport(this.state.viewport);
      const { longitude, latitude, zoom } = viewport.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat],
        ],
        {
          padding: 40,
        }
      );

      this.setState({
        viewport: {
          ...this.state.viewport,
          longitude,
          latitude,
          zoom,
          transitionInterpolator: new LinearInterpolator({
            around: [event.offsetCenter.x, event.offsetCenter.y],
          }),
          transitionDuration: 1000,
        },
      });
    }
  };
  _switchMode = (evt: any) => {
    const modeId =
      evt.target.value === this.state.modeId ? null : evt.target.value;
    const mode = MODES.find((m) => m.id === modeId);
    const modeHandler = mode ? new mode.handler() : null;
    this.setState({ modeId, modeHandler });
  };

  _renderToolbar = () => {
    return (
      <div
        style={{ position: "absolute", top: 0, right: 0, maxWidth: "320px" }}
      >
        <select onChange={this._switchMode}>
          <option value="">--Please choose a draw mode--</option>
          {MODES.map((mode) => (
            <option key={mode.id} value={mode.id}>
              {mode.text}
            </option>
          ))}
        </select>
      </div>
    );
  };
  _update = (
    data: any,
    editType: string,
    editContext: any,
    featureIndexes: any
  ) => {
    this.setState({ editData: data.data });
  };

  render() {
    const stateHovered: any = this.state.stateHovered;
    const alStates: any = data;
    const showpopup: any = this.state.showpopup;

    const modeHandler: any = this.state.modeHandler;
    return (
      <ReactMapGL
        {...this.state.viewport}
        ref={this.mapRef}
        width="100%"
        height="100vh"
        mapStyle="mapbox://styles/mapbox/dark-v9"
        mapboxApiAccessToken={accessToken}
        onViewportChange={(viewport) => this.setState({ viewport })}
        onHover={this._onHover}
        onClick={this._onClick}
      >
        <Editor
          // to make the lines/vertices easier to interact with
          onUpdate={this._update}
          clickRadius={12}
          mode={modeHandler}
        />
        {this._renderToolbar()}
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
        {showpopup && (
          <>
            <Popup
              latitude={showpopup.geometry?.coordinates[1]}
              longitude={showpopup.geometry?.coordinates[0]}
              closeButton={true}
              closeOnClick={false}
              onClose={() => this.setState({ showpopup: null })}
              anchor="top"
            >
              <div>You are here</div>
            </Popup>
          </>
        )}
      </ReactMapGL>
    );
  }
}
export default Map;
