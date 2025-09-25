import React, { useState, useEffect } from "react";
import { UnitExtra } from "./UnitCard/UnitExtra";
import { UnitFactions } from "./UnitCard/UnitFactions";
import { UnitInvulTop } from "./UnitCard/UnitInvulTop";
import { UnitKeywords } from "./UnitCard/UnitKeywords";
import { UnitName } from "./UnitCard/UnitName";
import { UnitStats } from "./UnitCard/UnitStats";
import { UnitWeapons } from "./UnitCard/UnitWeapons";
import { useIndexedDBImages } from "../../Hooks/useIndexedDBImages";

export const UnitCardFront = ({ unit, cardStyle, paddingTop = "32px", className }) => {
  const { getImageUrl, isReady } = useIndexedDBImages();
  const [localImageUrl, setLocalImageUrl] = useState(null);

  console.log("[UnitCardFront] Rendering with unit:", {
    id: unit?.id,
    uuid: unit?.uuid,
    hasLocalImage: unit?.hasLocalImage,
    externalImage: unit?.externalImage,
    name: unit?.name,
  });

  useEffect(() => {
    let isMounted = true;
    let objectUrl = null;

    const loadLocalImage = async () => {
      console.log("[UnitCardFront] Effect triggered:", {
        hasLocalImage: unit?.hasLocalImage,
        uuid: unit?.uuid,
        isReady,
      });

      // Always use uuid for local images (unique per card instance)
      if (unit?.hasLocalImage && unit?.uuid && isReady) {
        try {
          console.log("[UnitCardFront] Loading image for UUID:", unit.uuid);
          const url = await getImageUrl(unit.uuid);

          if (isMounted && url) {
            objectUrl = url;
            console.log("[UnitCardFront] Got object URL:", objectUrl);
            setLocalImageUrl(objectUrl);
          }
        } catch (error) {
          console.error("[UnitCardFront] Failed to load local image:", error);
        }
      } else {
        console.log("[UnitCardFront] Skipping image load:", {
          hasLocalImage: unit?.hasLocalImage,
          hasUuid: !!unit?.uuid,
          isReady,
        });
        if (isMounted) {
          setLocalImageUrl(null);
        }
      }
    };

    loadLocalImage();

    return () => {
      isMounted = false;
      if (objectUrl) {
        console.log("[UnitCardFront] Cleaning up object URL:", objectUrl);
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [unit?.uuid, unit?.hasLocalImage, isReady]); // Removed getImageUrl from dependencies
  return (
    <div
      className={className}
      style={{
        ...cardStyle,
        justifyContent: "center",
        justifyItems: "center",
        display: "flex",
      }}>
      <div className={`unit front`} data-name={unit.name} data-fullname={`${unit.name} ${unit.subname}`}>
        <div className={"header"}>
          <UnitName
            name={unit.name}
            subname={unit.subname}
            points={unit.points}
            legends={unit.legends}
            combatPatrol={unit.combatPatrol}
            externalImage={unit.externalImage}
            localImageUrl={localImageUrl}
            imageZIndex={unit.imageZIndex}
            imagePositionX={unit.imagePositionX}
            imagePositionY={unit.imagePositionY}
          />
          <UnitStats stats={unit.stats} />
          <div className="stats_container" key={`stat-line-invul`}>
            {unit.abilities?.invul?.showInvulnerableSave && unit.abilities?.invul?.showAtTop && (
              <UnitInvulTop invul={unit.abilities?.invul} />
            )}
          </div>
        </div>
        <div className="data_container">
          <div className="data">
            <UnitWeapons unit={unit} />
            <UnitExtra unit={unit} />
          </div>
        </div>
        <div className="footer">
          <UnitKeywords keywords={unit.keywords} />
          <UnitFactions factions={unit.factions} />
        </div>
        <div className="faction">
          <div className={unit.faction_id}></div>
        </div>
      </div>
    </div>
  );
};
