'use client'

import {motion, useAnimationFrame} from 'framer-motion'
import {useEffect, useRef, useState} from 'react'

// ── Design tokens pulled directly from the Figma frames ──
// Desktop: "landing_page" (79:244), a fixed 1185 × 786 stage.
// Mobile:  "landing_page_mobile" (116:204), a fixed 402 × 874 stage.
// Every element is positioned in its stage's space and the whole stage is
// uniformly scaled to fit the viewport, preserving aspect ratio.
const STAGE_W = 1185
const STAGE_H = 786
const M_STAGE_W = 402
const M_STAGE_H = 874

// The wiggly bezier the "coming soon" text rides along — exact vectorPaths data
// from the TEXT_PATH node (83:526 / 79:257), in its own 1420 × 650 local space.
const WIGGLE_PATH =
  'M -300 117.32930421551146 L 0 117.32930421551146 C 10.659698537367 117.2461428357628 37.907730809005805 115.27373493085777 83.51666826344598 90.89587447749942 C 111.04342639256407 76.18289205179748 156.12399054469975 47.005016503426184 184.8726287034667 30.53500719084395 C 223.2154920281402 8.568495396556031 243.06993028939513 4.132173283523663 267.40683991335897 1.721556338790336 C 306.23025916480856 -2.123976375403241 333.39043706975576 1.2831083539691743 343.1281939645128 4.07433026093349 C 374.84493525167716 13.16558847177521 392.2046680039068 29.700834420087027 405.24718369598133 44.030736842768235 C 413.13900312484145 52.701533679614386 415.4468538328428 72.55792431492719 416.41112425636925 103.30865659168707 C 416.685155491946 112.0475553772676 401.9706099970085 136.79331980926884 378.1060896970577 176.20708991322817 C 367.4790619930909 193.75829993606888 357.9604427638474 205.1477138595116 338.91455714077415 227.6301883709065 C 319.8686715177009 250.11266288230138 291.09744105677754 283.03938203277545 273.53156792000215 305.19791365333674 C 255.96569478322672 327.35644527389803 250.47704120664469 337.74902214663985 244.01514232753172 353.5577164806552 C 229.18243507811417 389.8451518569749 220.96836928018658 421.69005264258016 218.05732715609932 443.6824572846774 C 212.33639822348482 486.90305829243476 221.94513569310104 501.08016195660457 229.24447619914088 512.0933748394121 C 238.07647503403774 525.4190563642716 261.56207012518973 531.630497005776 295.74352455679144 534.5536668530083 C 317.20004537802737 536.388610721582 356.86249756464974 534.5905890368443 380.47458139226137 535.2421379968097 C 422.46149195438807 536.4007196633255 437.41139953520934 546.7357866636967 447.98494409871637 555.0646821913524 C 466.5989461578349 569.7271333941648 473.23990222487555 595.7600443366946 487.52101884463883 618.6795102220229 C 502.73236311317294 643.0918782571842 522.4832815767683 645.6666345191994 539.9711518642284 648.692889667913 C 569.4326872724959 653.7911737121785 590.8085208791401 640.9350773719385 610.1377537134223 635.5460862250502 C 641.785491629587 626.7226947947607 653.7435723958075 625.9066694977397 673.3830860151404 619.9936669603006 C 697.904036076245 612.6109770205671 722.3196944522313 604.3482383455636 746.0695535856266 600.9437010729301 C 779.150093948362 596.2016124723267 801.7500305516165 598.9727051408372 809.7734892783179 601.1928620583059 C 823.1887809042047 604.9049832192927 835.8426621223001 610.1849122613156 855.4891055610534 613.4515164983943 C 894.2808401627216 619.9013990906689 926.9228531205902 621.4321807014584 939.4413574196699 621.2697561265983 C 953.8046589559034 621.0833957772037 970.0417447467512 611.6330086548625 979.56297463547 605.0925947016221 C 990.9544722750323 597.2674385210742 999.1432133124919 575.2398732637794 1007.646936828055 540.91694218115 C 1014.3341779270189 513.9257423217201 1021.2806670199317 466.46865276340753 1027.019038430379 436.96794138533016 C 1034.818789731898 396.8697686977718 1045.1765008609552 374.600535386807 1056.5359829116892 353.61559617188124 C 1070.0881093573375 328.580076547674 1079.7856228846883 323.1170269177623 1099.8698050762366 311.2154203289218 C 1115.2178529682062 302.12038101050075 1147.8351110957137 299.4963418945634 1194.8666530620828 299.1942518753677 C 1219.4680308933591 299.0362338593891 1240.5857379398185 313.2655368584348 1254.4956603522614 324.2950512531979 C 1259.1712530753368 328.0024419758916 1264.7639199099171 335.43199185257845 1274.986863666934 351.65594171988124 C 1285.2098074239507 367.87989158718403 1299.3420744413133 393.2804848872847 1312.4124288144674 413.8787561008084 C 1325.4827831876214 434.47702731433213 1337.0629684150842 449.50324465213225 1354.477520593948 468.5851590559031 C 1371.8920727728116 487.66707345967393 1394.7901287039338 510.34936144871523 1419.5159912109375 533.8843474244782 L 1854.2 947.7'

// The mobile wiggle bezier — exact vectorPaths data from the TEXT_PATH node
// (116:240), in its own local space. The node sits at frame (-34.963, -3.862),
// applied below as a <g translate>. A straight lead-in before the first point and
// a lead-out continuing the final tangent push the crawl on/off past the viewport
// edges — the same trick as desktop, so glyphs roll on/off instead of popping.
const M_WIGGLE_PATH =
  'M -300 0 L 18.040990829467773 0 C 23.464258670806885 0 38.25937604904175 2.8217878341674805 45.82036209106445 8.163153648376465 C 53.450966358184814 13.553699970245361 63.87577724456787 26.593667030334473 75.76164245605469 39.13985824584961 C 85.25807189941406 49.16386699676514 92.30495738983154 61.79020977020264 100.64303588867188 73.12905883789062 C 111.1709508895874 87.44583988189697 127.2045431137085 94.64239263534546 137.3673095703125 100.89009094238281 C 145.38880729675293 105.82141542434692 159.69726181030273 112.85019445419312 174.74954223632812 116.96761322021484 C 207.08585357666016 125.81292629241943 248.87461185455322 119.9199184179306 259.0608215332031 121.09209442138672 C 268.60185623168945 122.1900269985199 278.34025478363037 123.56148219108582 290.43365478515625 124.99935150146484 C 300.02735805511475 126.14001417160034 310.4215078353882 132.1191234588623 320.0767822265625 138.37478637695312 C 330.10382652282715 144.871319770813 341.8206424713135 153.60916328430176 350.1626281738281 159.60289001464844 C 357.05763387680054 164.55695962905884 364.46710300445557 173.89562606811523 373.731201171875 184.72262573242188 C 383.5818099975586 196.2350835800171 390.5363030433655 205.95073127746582 396.1357727050781 216.47018432617188 C 404.9528980255127 233.03449249267578 408.81861686706543 242.51180458068848 416.078857421875 258.2025451660156 C 439.1870365142822 308.1436538696289 441.48897075653076 319.68935775756836 451.5024719238281 340.4998779296875 C 465.69818687438965 370.00206565856934 466.53566312789917 381.3987331390381 469.7904052734375 392.604736328125 C 473.285537481308 404.63839626312256 477.21030712127686 421.50276374816895 484.4539794921875 450.02838134765625 C 488.86992597579956 467.41840171813965 491.29412722587585 486.33522033691406 494.8544616699219 532.3942260742188 C 496.5103632211685 553.8161392211914 496.3616952896118 562.6577091217041 492.28143310546875 581.766357421875 C 488.95369601249695 597.3507871627808 482.9682369232178 612.8370666503906 476.7396240234375 627.8364868164062 C 472.87360072135925 637.1464424133301 467.6118178367615 644.7004232406616 463.78533935546875 652.1320190429688 C 459.63712215423584 660.1884803771973 453.6787176132202 666.3309965133667 443.1697082519531 675.8256225585938 C 433.743821144104 684.3416748046875 426.33815813064575 696.2449216842651 420.105224609375 704.098876953125 C 417.26296973228455 707.6803276538849 397.2207622528076 714.4905977249146 369.00152587890625 725.9994506835938 C 341.7868766784668 737.0985956192017 304.6267566680908 751.3338584899902 283.5618896484375 759.3731079101562 C 269.8983449935913 764.5876975059509 244.43657112121582 766.6344685554504 213.32908630371094 768.3213500976562 C 164.16707229614258 770.9872839450836 130.5214228630066 768.1138226985931 124.106201171875 766.2794799804688 C 113.83358860015869 763.3421704769135 106.39435815811157 750.8384227752686 102.12004852294922 742.3117065429688 C 97.03374481201172 732.1651630401611 96.68724393844604 720.3444156646729 96.93475341796875 700.3312377929688 C 97.14982487261295 682.9409408569336 111.21966552734375 671.6014308929443 120.60879516601562 665.4036254882812 C 133.5199270248413 656.8809309005737 154.32989883422852 654.7459597587585 165.29196166992188 654.0792846679688 C 190.44114303588867 652.5497975349426 203.61884689331055 658.2915120124817 212.2152557373047 663.6172485351562 C 222.35553550720215 669.8994607925415 227.45353960990906 678.1874113082886 230.47384643554688 687.5648193359375 C 234.63303661346436 700.4782180786133 227.46300888061523 709.4454326629639 222.73440551757812 717.533447265625 C 218.50426578521729 724.7688674926758 210.1498212814331 729.7787446975708 200.9545135498047 736.682861328125 C 194.1312108039856 741.806004524231 174.0846652984619 740.4846227169037 159.42254638671875 737.3445434570312 C 149.6541290283203 735.2525126934052 142.11852359771729 727.624529838562 130.31756591796875 718.4490966796875 C 122.34047031402588 712.2467770576477 112.31114482879639 702.777096748352 103.36312103271484 693.1920776367188 C 93.07745933532715 682.1741962432861 83.27409172058105 661.9222717285156 67.44824981689453 624.0895385742188 C 60.52967023849487 607.5502109527588 49.742791175842285 589.1578884124756 41.03746795654297 576.6521606445312 C 34.45162391662598 567.1911935806274 26.58885955810547 558.1663103103638 19.86417579650879 550.3828735351562 C 17.110463857650757 546.8518059253693 14.209628582000732 543.4170706272125 10.542182922363281 539.6194458007812 C 8.436887264251709 537.3839709758759 5.8357834815979 534.5224885940552 0 528.41845703125 L -484 22'

// The mobile TEXT_PATH node's offset within its frame (node 116:240 sits at
// x=-34.963, y=-3.862 relative to the 402×874 frame) — the base <g translate>
// that lands M_WIGGLE_PATH's local coords in stage space.
const M_WIGGLE_OFFSET = {x: -34.96337890625, y: -3.86163330078125}

// Nudge (in stage units) applied on top of the node offset: push the wiggle UP
// (negative y) and RIGHT (positive x) so it clears the centre logo/COFFEE and the
// bottom-right blob, exiting off the right edge low and off the top-left high.
const M_WIGGLE_SHIFT = {x: -8, y: -26}

// One repeating text unit + how many copies we lay down along the path.
const UNIT = 'comingsoon'
const REPEAT = 40
const CRAWL_TEXT = UNIT.repeat(REPEAT)
const CRAWL_SECONDS = 9 // time to advance exactly one unit → perfectly seamless loop

export default function Page() {
  const [isMobile, setIsMobile] = useState(false)
  const [scale, setScale] = useState(1)

  // Track the 768px breakpoint and fit the *active* stage into the viewport,
  // preserving aspect ratio. matchMedia drives the desktop⇄mobile switch.
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const fit = () => {
      const mobile = mq.matches
      setIsMobile(mobile)
      const w = mobile ? M_STAGE_W : STAGE_W
      const h = mobile ? M_STAGE_H : STAGE_H
      setScale(Math.min(window.innerWidth / w, window.innerHeight / h))
    }
    fit()
    window.addEventListener('resize', fit)
    mq.addEventListener('change', fit)
    return () => {
      window.removeEventListener('resize', fit)
      mq.removeEventListener('change', fit)
    }
  }, [])

  // Seamless crawl: measure one text unit's rendered advance, then slide the
  // textPath's startOffset and wrap modulo that unit so the loop is invisible.
  // Only one layout's text element is mounted at a time, so the refs always
  // point at whichever (desktop or mobile) is on screen.
  const textRef = useRef<SVGTextElement>(null)
  const textPathRef = useRef<SVGTextPathElement>(null)
  const unitLen = useRef(0)

  useEffect(() => {
    const measure = () => {
      if (textRef.current) {
        unitLen.current = textRef.current.getComputedTextLength() / REPEAT
      }
    }
    // Measure only once the Martian Mono web font is actually applied. Measuring
    // before it loads captures the fallback font's metrics, so the crawl would
    // wrap modulo a slightly-wrong unit and the seam would glitch every cycle.
    // Re-run on breakpoint change — the mobile text rides at a smaller font size,
    // so its unit advance (and thus the seamless wrap) differs from desktop.
    measure()
    document.fonts.ready.then(measure)
  }, [isMobile])

  useAnimationFrame((t) => {
    const unit = unitLen.current
    if (!unit || !textPathRef.current) return
    // Positive startOffset advances the glyph run toward the path's end, streaming
    // the text along the wiggle. The off-stage lead-in/lead-out on the path absorb
    // the gap startOffset opens and give leading glyphs track to ride off-screen,
    // so glyphs roll on/off beyond the edges with no pop. Wrapping modulo one
    // repeated unit keeps the loop seamless (the text is periodic).
    const offset = ((t / 1000) * (unit / CRAWL_SECONDS)) % unit
    textPathRef.current.setAttribute('startOffset', String(offset))
  })

  const ease = [0.22, 1, 0.36, 1] as const

  // ── Mobile layout (≤768px): 402×874 stage, blob in the BOTTOM-right corner,
  // wiggle running more vertically down the full height. ──
  if (isMobile) {
    return (
      <div className="fixed inset-0 overflow-hidden bg-st-bg font-mono">
        {/* Layer 0: the vertical "coming soon" wiggle — a full-viewport SVG layer
            (100vw × 100vh). preserveAspectRatio="xMidYMid meet" gives the path the
            SAME centered fit as the content stage (1 viewBox unit = the stage
            `scale`), so the coordinate space already accounts for the scale factor;
            the <g> translate then nudges the path (node offset + M_WIGGLE_SHIFT) up
            and right in stage units. overflow:visible + the page's overflow-hidden
            let it roll off the real screen edges. */}
        <motion.svg
          viewBox={`0 0 ${M_STAGE_W} ${M_STAGE_H}`}
          preserveAspectRatio="xMidYMid meet"
          fill="none"
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          transition={{duration: 1.2, ease, delay: 0.2}}
          style={{position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0, pointerEvents: 'none', overflow: 'visible'}}
        >
          <defs>
            <path id="wiggle-m" d={M_WIGGLE_PATH} fill="none" />
          </defs>
          <g transform={`translate(${M_WIGGLE_OFFSET.x + M_WIGGLE_SHIFT.x} ${M_WIGGLE_OFFSET.y + M_WIGGLE_SHIFT.y})`}>
            <text
              ref={textRef}
              fill="#6ad0ef"
              style={{fontWeight: 300, fontSize: 15.46, letterSpacing: '0.22em'}}
            >
              <textPath ref={textPathRef} href="#wiggle-m" startOffset={0}>
                {CRAWL_TEXT}
              </textPath>
            </text>
          </g>
        </motion.svg>

        {/* Layer 1: green blob + address — anchored to the real BOTTOM-right
            VIEWPORT corner (node 116:218 moves to the bottom this time). Scaled by
            the same factor and pinned via transformOrigin 'bottom right'; child
            offsets are measured from the frame's bottom-right corner (stage
            x=402, y=874) so the blob always hugs the corner regardless of aspect. */}
        <div
          className="absolute bottom-0 right-0"
          style={{zIndex: 10, pointerEvents: 'none', width: 0, height: 0, transform: `scale(${scale})`, transformOrigin: 'bottom right'}}
        >
          {/* Full organic blob at the node's unrotated size + rotation (116:218):
              its center sits just past the corner, the rest bleeds off-viewport.
              Wrapper owns position/rotation; Framer drives just the entrance. */}
          <div
            style={{position: 'absolute', right: -73.34, bottom: -130.54, width: 281.33, height: 213.88, transform: 'rotate(36.458deg)', transformOrigin: 'center'}}
          >
            <motion.img
              src="/images/blob-mobile.svg"
              alt=""
              aria-hidden
              initial={{opacity: 0, scale: 0.92}}
              animate={{opacity: 1, scale: 1}}
              transition={{duration: 1, ease, delay: 0.1}}
              style={{display: 'block', width: '100%', height: '100%'}}
            />
          </div>
          {/* Address, cream, within the visible green (node 116:219) */}
          <motion.span
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            transition={{duration: 0.6, ease, delay: 0.55}}
            style={{position: 'absolute', right: 28, bottom: 22, width: 128, fontWeight: 300, fontSize: 14, color: '#fff1e7'}}
          >
            519 Hagan Ave
          </motion.span>
        </div>

        {/* Layer 2: centered + scaled content stage — horse, logo lockup and the
            COFFEE wordmark, stacked vertically per the mobile frame. */}
        <div className="absolute inset-0 flex items-center justify-center" style={{zIndex: 20}}>
          <div
            className="relative shrink-0"
            style={{width: M_STAGE_W, height: M_STAGE_H, transform: `scale(${scale})`, transformOrigin: 'center'}}
          >
            {/* Horse line illustration (node 116:216 — same asset as desktop, scaled) */}
            <motion.img
              src="/images/horse.svg"
              alt="Line illustration of a horse"
              width={190.7}
              height={216.15}
              initial={{opacity: 0, y: -24}}
              animate={{opacity: 1, y: 0}}
              transition={{duration: 0.8, ease, delay: 0.35}}
              style={{position: 'absolute', left: 105, top: 165}}
            />

            {/* "SHINY THING" mobile lockup (node 128:248 — stacked, distinct from desktop) */}
            <motion.img
              src="/images/logo-mobile.svg"
              alt="Shiny Thing"
              width={234}
              height={135}
              initial={{opacity: 0, y: 24}}
              animate={{opacity: 1, y: 0}}
              transition={{duration: 0.8, ease, delay: 0.55}}
              style={{position: 'absolute', left: 84, top: 388}}
            />

            {/* "COFFEE" (node 116:217) */}
            <motion.span
              initial={{opacity: 0, y: 20}}
              animate={{opacity: 1, y: 0}}
              transition={{duration: 0.8, ease, delay: 0.7}}
              style={{
                position: 'absolute',
                left: 135.27,
                top: 546.7,
                width: 129.4,
                textAlign: 'center',
                fontWeight: 700,
                fontSize: 24.366832733154297,
                letterSpacing: '0.22em',
                textIndent: '0.22em',
                color: '#ff0000',
              }}
            >
              COFFEE
            </motion.span>
          </div>
        </div>
      </div>
    )
  }

  // ── Desktop layout (>768px): 1185×786 stage, blob in the TOP-right corner. ──
  return (
    <div className="fixed inset-0 overflow-hidden bg-st-bg font-mono">
      {/* ── Layer 0: the "coming soon" wiggle — a full-viewport decorative layer.
          Uses the SAME centered + scaled frame as the content so it keeps wrapping
          the logo/horse exactly as designed, but as a sibling (not clipped by the
          stage) it bleeds past the frame to the real viewport edges. Its path
          endpoints land off-viewport, so the page container's overflow-hidden
          clips the textPath "pop" — the crawl rolls on/off the screen edges. ── */}
      <div className="absolute inset-0 flex items-center justify-center" style={{zIndex: 0, pointerEvents: 'none'}}>
        <div
          className="relative shrink-0"
          style={{width: STAGE_W, height: STAGE_H, transform: `scale(${scale})`, transformOrigin: 'center'}}
        >
          {/* Intrinsic path is 1420×656; its rotated bounding box sits at frame-rel
              (-131,-1), so placing the element at (-93,92) with rotate(-7.77°) lands
              the AABB to match Figma (node 79:257). */}
          <motion.svg
            width={1420}
            height={656}
            viewBox="0 -2 1420 656"
            fill="none"
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            transition={{duration: 1.2, ease, delay: 0.2}}
            style={{position: 'absolute', left: -93, top: 92, transform: 'rotate(8deg)', overflow: 'visible'}}
          >
            <defs>
              <path id="wiggle" d={WIGGLE_PATH} fill="none" />
            </defs>
            <text
              ref={textRef}
              fill="#6ad0ef"
              style={{fontWeight: 300, fontSize: 20, letterSpacing: '0.22em'}}
            >
              <textPath ref={textPathRef} href="#wiggle" startOffset={0}>
                {CRAWL_TEXT}
              </textPath>
            </text>
          </motion.svg>
        </div>
      </div>

      {/* ── Layer 1: green blob + address — anchored to the real top-right VIEWPORT
          corner (not the scaled stage), so the blob always hugs the corner as a
          full-bleed decoration regardless of window aspect ratio. Scaled by the same
          factor as the design and pinned via transformOrigin 'top right'. Child
          offsets are the design positions measured from the frame's top-right corner
          (stage x=STAGE_W, y=0): the blob box right edge sits 78px past the corner
          (1263 − 1185) and the address right edge 52px inside it (1185 − 1133). On a
          width-fit window this is pixel-identical to the old stage placement; on
          wider windows it stays pinned to the corner instead of drifting inward. ── */}
      <div
        className="absolute top-0 right-0"
        style={{zIndex: 10, pointerEvents: 'none', width: 0, height: 0, transform: `scale(${scale})`, transformOrigin: 'top right'}}
      >
        {/* Full organic blob at the node's size + rotation (79:258): only its rounded
            corner pokes into the top-right; the rest bleeds off the viewport. Wrapper
            owns position/rotation; Framer drives just the entrance. */}
        <div
          style={{position: 'absolute', right: -78, top: -231, width: 422, height: 374, transform: 'rotate(-37.53deg)', transformOrigin: 'center'}}
        >
          <motion.img
            src="/images/blob.svg"
            alt=""
            aria-hidden
            initial={{opacity: 0, scale: 0.92}}
            animate={{opacity: 1, scale: 1}}
            transition={{duration: 1, ease, delay: 0.1}}
            style={{display: 'block', width: '100%', height: '100%'}}
          />
        </div>
        {/* Address, cream, within the visible green (node 79:259) */}
        <motion.span
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          transition={{duration: 0.6, ease, delay: 0.55}}
          style={{position: 'absolute', right: 52, top: 52, width: 183, fontWeight: 300, fontSize: 20, color: '#fff1e7'}}
        >
          519 Hagan Ave
        </motion.span>
      </div>

      {/* ── Layer 2: centered + scaled content stage — only the logo, horse and
          COFFEE/SHINY THING wordmark live here. ── */}
      <div className="absolute inset-0 flex items-center justify-center" style={{zIndex: 20}}>
        <div
          className="relative shrink-0"
          style={{width: STAGE_W, height: STAGE_H, transform: `scale(${scale})`, transformOrigin: 'center'}}
        >
          {/* Horse line illustration, centered above the wordmark (node 79:225) */}
          <motion.img
            src="/images/horse.svg"
            alt="Line illustration of a horse"
            width={242}
            height={274}
            initial={{opacity: 0, y: -24}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.8, ease, delay: 0.35}}
            style={{position: 'absolute', left: 470, top: 119}}
          />

          {/* "SHINY THING" wordmark (node 79:311) */}
          <motion.img
            src="/images/logo.svg"
            alt="Shiny Thing"
            width={505}
            height={76}
            initial={{opacity: 0, y: 24}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.8, ease, delay: 0.55}}
            style={{position: 'absolute', left: 340, top: 393}}
          />

          {/* "COFFEE" (node 79:256) */}
          <motion.span
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.8, ease, delay: 0.7}}
            style={{
              position: 'absolute',
              left: 493,
              top: 488,
              width: 220,
              textAlign: 'center',
              fontWeight: 700,
              fontSize: 37.21,
              letterSpacing: '0.22em',
              textIndent: '0.22em',
              color: '#ff0000',
            }}
          >
            COFFEE
          </motion.span>
        </div>
      </div>
    </div>
  )
}
