import React, { useState, useEffect } from "react";
import PolygonAnnotation from "components/PolygonAnnotation";
import { Stage, Layer, Image } from "react-konva";
import Button from "components/Button";
import ImageUploading from 'react-images-uploading';

const wrapperStyle = {
  display: "flex",
  justifyContent: "center",
  backgroundColor: "aliceblue",
};

const colors = [
  "red",
  "green",
  "yellow",
  "black",
  "blue"
]

const Canvas = () => {
  const [points, setPoints] = useState([]);
  const [size, setSize] = useState({});
  const [flattenedPoints, setFlattenedPoints] = useState();
  const [position, setPosition] = useState([0, 0]);
  const [isMouseOverPoint, setMouseOverPoint] = useState(false);
  const [isPolyComplete, setPolyComplete] = useState(false);
  const [selectedColor, setSelectedColor] = useState(colors[0]);


  // image upload
  const [images, setImages] = React.useState([]);
  const maxNumber = 69;

  const onChange = (imageList, addUpdateIndex) => {
    // data for submit
    console.log(imageList, addUpdateIndex);
    setImages(imageList);
  };

  const getMousePos = (stage) => {
    return [stage.getPointerPosition().x, stage.getPointerPosition().y];
  };

  //drawing begins when mousedown event fires.
  const handleMouseDown = (e) => {
    if (isPolyComplete) return;
    const stage = e.target.getStage();
    const mousePos = getMousePos(stage);
    if (isMouseOverPoint && points.length >= 3) {
      setPolyComplete(true);
    } else {
      setPoints([...points, mousePos]);
    }
  };
  const handleMouseMove = (e) => {
    const stage = e.target.getStage();
    const mousePos = getMousePos(stage);
    setPosition(mousePos);
  };
  const handleMouseOverStartPoint = (e) => {
    if (isPolyComplete || points.length < 3) return;
    e.target.scale({ x: 3, y: 3 });
    setMouseOverPoint(true);
  };
  const handleMouseOutStartPoint = (e) => {
    e.target.scale({ x: 1, y: 1 });
    setMouseOverPoint(false);
  };
  const handlePointDragMove = (e) => {
    const stage = e.target.getStage();
    const index = e.target.index - 1;
    const pos = [e.target._lastPos.x, e.target._lastPos.y];
    if (pos[0] < 0) pos[0] = 0;
    if (pos[1] < 0) pos[1] = 0;
    if (pos[0] > stage.width()) pos[0] = stage.width();
    if (pos[1] > stage.height()) pos[1] = stage.height();
    setPoints([...points.slice(0, index), pos, ...points.slice(index + 1)]);
  };

  useEffect(() => {
    setFlattenedPoints(
      points
        .concat(isPolyComplete ? [] : position)
        .reduce((a, b) => a.concat(b), [])
    );
  }, [points, isPolyComplete, position]);
  const undo = () => {
    setPoints(points.slice(0, -1));
    setPolyComplete(false);
    setPosition(points[points.length - 1]);
  };
  const reset = () => {
    setPoints([]);
    setPolyComplete(false);
  };
  const handleGroupDragEnd = (e) => {
    if (e.target.name() === "polygon") {
      let result = [];
      let copyPoints = [...points];
      copyPoints.map((point) =>
        result.push([point[0] + e.target.x(), point[1] + e.target.y()])
      );
      e.target.position({ x: 0, y: 0 });
      setPoints(result);
    }
  };

  return (
    <div>
      <div>
        <ImageUploading
          multiple
          value={images}
          onChange={onChange}
          maxNumber={maxNumber}
          dataURLKey="data_url"
        >
          {({
            imageList,
            onImageUpload,
            onImageRemoveAll,
            onImageUpdate,
            onImageRemove,
            isDragging,
            dragProps,
          }) => (
            <div className="upload__image-wrapper">
              <button
                className="btn btn-info my-2"
                style={isDragging ? { color: 'red' } : undefined}
                onClick={onImageUpload}
                {...dragProps}
              >
                Click here for uploading images
              </button>
              &nbsp;
              <button onClick={onImageRemoveAll} className="btn btn-info my-2">Remove all images</button>
              {imageList.map((image, index) => (
                <div key={index} className="image-item">
                  <div className="image-item__btn-wrapper">
                    <button onClick={() => onImageUpdate(index)} className="btn btn-info m-2">Update Image</button>
                    <button onClick={() => onImageRemove(index)} className="btn btn-info m-2">Remove Image</button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </ImageUploading>
      </div>

      <div style={wrapperStyle}>
        <div style={{ backgroundImage: `url(${images[0] ? images[0].data_url : "http://dcscabs.com//assets/images/no_image.png"})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <Stage
            width={size.width || 650}
            height={size.height || 402}
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
          >
            <Layer>
              <div >
                <Image
                  x={0}
                  y={0}
                  width={size.width}
                  height={size.height}
                />
              </div>
              <PolygonAnnotation
                points={points}
                flattenedPoints={flattenedPoints}
                handlePointDragMove={handlePointDragMove}
                handleGroupDragEnd={handleGroupDragEnd}
                handleMouseOverStartPoint={handleMouseOverStartPoint}
                handleMouseOutStartPoint={handleMouseOutStartPoint}
                isFinished={isPolyComplete}
                selectedColor={selectedColor}
              />
            </Layer>
          </Stage>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Button name="Undo" onClick={undo} />
            <Button name="Reset" onClick={reset} />
          </div>
        </div>
      </div>

      <div>
        <select
          className="form-select w-25 mx-auto mt-5"
          value={selectedColor}
          onChange={(e) => setSelectedColor(e.target.value)}
        >
          {
            colors.map(
              color => <option key={color} value={color}>{color}</option>
            )
          }
        </select>
      </div>
    </div>
  );
};

export default Canvas;
