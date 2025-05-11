/* eslint-disable no-unused-vars */
import * as React from "react";
const DatabaseDiagram = (props) => (
  <svg viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <marker
        id="arrow"
        viewBox="0 0 10 10"
        refX={9}
        refY={5}
        markerWidth={6}
        markerHeight={6}
        orient="auto"
      >
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#333" />
      </marker>
      <marker
        id="many"
        viewBox="0 0 12 12"
        refX={11}
        refY={6}
        markerWidth={10}
        markerHeight={10}
        orient="auto"
      >
        <path
          d="M 0 0 L 0 12 M 4 0 L 4 12 M 8 0 L 8 12"
          stroke="#333"
          strokeWidth={1}
        />
      </marker>
    </defs>
    <rect
      x={510}
      y={320}
      width={180}
      height={160}
      fill="#e6f2ff"
      stroke="#000"
      rx={5}
      ry={5}
    />
    <rect
      x={510}
      y={320}
      width={180}
      height={30}
      fill="#3498db"
      stroke="#000"
      rx={5}
      ry={5}
    />
    <text
      x={600}
      y={342}
      textAnchor="middle"
      fontFamily="Arial"
      fontWeight="bold"
      fill="white"
    >
      {"User"}
    </text>
    <line x1={510} y1={350} x2={690} y2={350} stroke="#000" strokeWidth={1} />
    <text x={520} y={370} fontFamily="Arial" fontSize={12}>
      <tspan fontWeight="bold">{"PK"}</tspan>
      {" id"}
    </text>
    <text x={520} y={390} fontFamily="Arial" fontSize={12}>
      {"phone_number"}
    </text>
    <text x={520} y={410} fontFamily="Arial" fontSize={12}>
      {"email"}
    </text>
    <text x={520} y={430} fontFamily="Arial" fontSize={12}>
      {"role"}
    </text>
    <text x={520} y={450} fontFamily="Arial" fontSize={12}>
      {"status"}
    </text>
    <text x={520} y={470} fontFamily="Arial" fontSize={12}>
      {"created_at"}
    </text>
    <rect
      x={180}
      y={50}
      width={200}
      height={370}
      fill="#ffe6e6"
      stroke="#000"
      rx={5}
      ry={5}
    />
    <rect
      x={180}
      y={50}
      width={200}
      height={30}
      fill="#e74c3c"
      stroke="#000"
      rx={5}
      ry={5}
    />
    <text
      x={280}
      y={72}
      textAnchor="middle"
      fontFamily="Arial"
      fontWeight="bold"
      fill="white"
    >
      {"Driver"}
    </text>
    <line x1={180} y1={80} x2={380} y2={80} stroke="#000" strokeWidth={1} />
    <text x={190} y={100} fontFamily="Arial" fontSize={12}>
      <tspan fontWeight="bold">{"PK"}</tspan>
      {" id"}
    </text>
    <text x={190} y={120} fontFamily="Arial" fontSize={12}>
      {"first_name"}
    </text>
    <text x={190} y={140} fontFamily="Arial" fontSize={12}>
      {"middle_name"}
    </text>
    <text x={190} y={160} fontFamily="Arial" fontSize={12}>
      {"last_name"}
    </text>
    <text x={190} y={180} fontFamily="Arial" fontSize={12}>
      {"gender"}
    </text>
    <text x={190} y={200} fontFamily="Arial" fontSize={12}>
      {"residence"}
    </text>
    <text x={190} y={220} fontFamily="Arial" fontSize={12}>
      {"national_id_number"}
    </text>
    <text x={190} y={240} fontFamily="Arial" fontSize={12}>
      {"driving_license_number"}
    </text>
    <text x={190} y={260} fontFamily="Arial" fontSize={12}>
      {"driving_categories"}
    </text>
    <text x={190} y={280} fontFamily="Arial" fontSize={12}>
      {"availability_status"}
    </text>
    <text x={190} y={300} fontFamily="Arial" fontSize={12}>
      {"national_id_card"}
    </text>
    <text x={190} y={320} fontFamily="Arial" fontSize={12}>
      {"driving_license_card"}
    </text>
    <text x={190} y={340} fontFamily="Arial" fontSize={12}>
      <tspan fontWeight="bold">{"FK"}</tspan>
      {" user (user_FK)"}
    </text>
    <text x={190} y={360} fontFamily="Arial" fontSize={12}>
      {"status"}
    </text>
    <text x={190} y={380} fontFamily="Arial" fontSize={12}>
      {"created_at"}
    </text>
    <text x={190} y={400} fontFamily="Arial" fontSize={12}>
      <tspan fontWeight="bold">{"FK"}</tspan>
      {" created_by (user_FK)"}
    </text>
    <rect
      x={180}
      y={520}
      width={200}
      height={240}
      fill="#e6ffe6"
      stroke="#000"
      rx={5}
      ry={5}
    />
    <rect
      x={180}
      y={520}
      width={200}
      height={30}
      fill="#2ecc71"
      stroke="#000"
      rx={5}
      ry={5}
    />
    <text
      x={280}
      y={542}
      textAnchor="middle"
      fontFamily="Arial"
      fontWeight="bold"
      fill="white"
    >
      {"Vehicle"}
    </text>
    <line x1={180} y1={550} x2={380} y2={550} stroke="#000" strokeWidth={1} />
    <text x={190} y={570} fontFamily="Arial" fontSize={12}>
      <tspan fontWeight="bold">{"PK"}</tspan>
      {" id"}
    </text>
    <text x={190} y={590} fontFamily="Arial" fontSize={12}>
      {"type"}
    </text>
    <text x={190} y={610} fontFamily="Arial" fontSize={12}>
      {"total_weight_to_carry"}
    </text>
    <text x={190} y={630} fontFamily="Arial" fontSize={12}>
      {"relocation_size"}
    </text>
    <text x={190} y={650} fontFamily="Arial" fontSize={12}>
      {"created_at"}
    </text>
    <text x={190} y={670} fontFamily="Arial" fontSize={12}>
      <tspan fontWeight="bold">{"FK"}</tspan>
      {" created_by (user_FK)"}
    </text>
    <text x={190} y={690} fontFamily="Arial" fontSize={12}>
      {"driving_category"}
    </text>
    <text x={190} y={710} fontFamily="Arial" fontSize={12}>
      {"vehicle_modal"}
    </text>
    <text x={190} y={730} fontFamily="Arial" fontSize={12}>
      {"plate_number"}
    </text>
    <text x={190} y={750} fontFamily="Arial" fontSize={12}>
      {"vehicle_image"}
    </text>
    <rect
      x={750}
      y={70}
      width={200}
      height={350}
      fill="#fff2e6"
      stroke="#000"
      rx={5}
      ry={5}
    />
    <rect
      x={750}
      y={70}
      width={200}
      height={30}
      fill="#f39c12"
      stroke="#000"
      rx={5}
      ry={5}
    />
    <text
      x={850}
      y={92}
      textAnchor="middle"
      fontFamily="Arial"
      fontWeight="bold"
      fill="white"
    >
      {"Relocation"}
    </text>
    <line x1={750} y1={100} x2={950} y2={100} stroke="#000" strokeWidth={1} />
    <text x={760} y={120} fontFamily="Arial" fontSize={12}>
      <tspan fontWeight="bold">{"PK"}</tspan>
      {" id"}
    </text>
    <text x={760} y={140} fontFamily="Arial" fontSize={12}>
      {"relocation_size"}
    </text>
    <text x={760} y={160} fontFamily="Arial" fontSize={12}>
      <tspan fontWeight="bold">{"FK"}</tspan>
      {" created_by (user_FK)"}
    </text>
    <text x={760} y={180} fontFamily="Arial" fontSize={12}>
      <tspan fontWeight="bold">{"FK"}</tspan>
      {" assigned_driver (driver_FK)"}
    </text>
    <text x={760} y={200} fontFamily="Arial" fontSize={12}>
      {"status"}
    </text>
    <text x={760} y={220} fontFamily="Arial" fontSize={12}>
      {"created_at"}
    </text>
    <text x={760} y={240} fontFamily="Arial" fontSize={12}>
      {"optimal_routes"}
    </text>
    <text x={760} y={260} fontFamily="Arial" fontSize={12}>
      {"alternative_routes"}
    </text>
    <text x={760} y={280} fontFamily="Arial" fontSize={12}>
      {"recommended_travel_time"}
    </text>
    <text x={760} y={300} fontFamily="Arial" fontSize={12}>
      {"condition"}
    </text>
    <text x={760} y={320} fontFamily="Arial" fontSize={12}>
      {"relocation_tips"}
    </text>
    <text x={760} y={340} fontFamily="Arial" fontSize={12}>
      {"adjusted_cost"}
    </text>
    <text x={760} y={360} fontFamily="Arial" fontSize={12}>
      {"origin"}
    </text>
    <text x={760} y={380} fontFamily="Arial" fontSize={12}>
      {"destination"}
    </text>
    <text x={760} y={400} fontFamily="Arial" fontSize={12}>
      {"move_dateTime"}
    </text>
    <rect
      x={1000}
      y={70}
      width={180}
      height={140}
      fill="#ffe6f2"
      stroke="#000"
      rx={5}
      ry={5}
    />
    <rect
      x={1000}
      y={70}
      width={180}
      height={30}
      fill="#e84393"
      stroke="#000"
      rx={5}
      ry={5}
    />
    <text
      x={1090}
      y={92}
      textAnchor="middle"
      fontFamily="Arial"
      fontWeight="bold"
      fill="white"
    >
      {"DemandForecast"}
    </text>
    <line x1={1000} y1={100} x2={1180} y2={100} stroke="#000" strokeWidth={1} />
    <text x={1010} y={120} fontFamily="Arial" fontSize={12}>
      <tspan fontWeight="bold">{"PK"}</tspan>
      {" id"}
    </text>
    <text x={1010} y={140} fontFamily="Arial" fontSize={12}>
      <tspan fontWeight="bold">{"FK"}</tspan>
      {" created_by (user_FK)"}
    </text>
    <text x={1010} y={160} fontFamily="Arial" fontSize={12}>
      <tspan fontWeight="bold">{"FK"}</tspan>
      {" relocation (relocation_FK)"}
    </text>
    <text x={1010} y={180} fontFamily="Arial" fontSize={12}>
      {"predicted_demand"}
    </text>
    <text x={1010} y={200} fontFamily="Arial" fontSize={12}>
      {"forecast_date"}
    </text>
    <rect
      x={750}
      y={450}
      width={180}
      height={160}
      fill="#f2e6ff"
      stroke="#000"
      rx={5}
      ry={5}
    />
    <rect
      x={750}
      y={450}
      width={180}
      height={30}
      fill="#9b59b6"
      stroke="#000"
      rx={5}
      ry={5}
    />
    <text
      x={840}
      y={472}
      textAnchor="middle"
      fontFamily="Arial"
      fontWeight="bold"
      fill="white"
    >
      {"Feedback"}
    </text>
    <line x1={750} y1={480} x2={930} y2={480} stroke="#000" strokeWidth={1} />
    <text x={760} y={500} fontFamily="Arial" fontSize={12}>
      <tspan fontWeight="bold">{"PK"}</tspan>
      {" id"}
    </text>
    <text x={760} y={520} fontFamily="Arial" fontSize={12}>
      <tspan fontWeight="bold">{"FK"}</tspan>
      {" created_by (user_FK)"}
    </text>
    <text x={760} y={540} fontFamily="Arial" fontSize={12}>
      <tspan fontWeight="bold">{"FK"}</tspan>
      {" relocation (relocation_FK)"}
    </text>
    <text x={760} y={560} fontFamily="Arial" fontSize={12}>
      {"rating"}
    </text>
    <text x={760} y={580} fontFamily="Arial" fontSize={12}>
      {"comment"}
    </text>
    <text x={760} y={600} fontFamily="Arial" fontSize={12}>
      {"created_at"}
    </text>
    <rect
      x={510}
      y={510}
      width={180}
      height={280}
      fill="#e6ffff"
      stroke="#000"
      rx={5}
      ry={5}
    />
    <rect
      x={510}
      y={510}
      width={180}
      height={30}
      fill="#00bcd4"
      stroke="#000"
      rx={5}
      ry={5}
    />
    <text
      x={600}
      y={532}
      textAnchor="middle"
      fontFamily="Arial"
      fontWeight="bold"
      fill="white"
    >
      {"ManPower"}
    </text>
    <line x1={510} y1={540} x2={690} y2={540} stroke="#000" strokeWidth={1} />
    <text x={520} y={560} fontFamily="Arial" fontSize={12}>
      <tspan fontWeight="bold">{"PK"}</tspan>
      {" id"}
    </text>
    <text x={520} y={580} fontFamily="Arial" fontSize={12}>
      <tspan fontWeight="bold">{"FK"}</tspan>
      {" user (user_FK)"}
    </text>
    <text x={520} y={600} fontFamily="Arial" fontSize={12}>
      {"first_name"}
    </text>
    <text x={520} y={620} fontFamily="Arial" fontSize={12}>
      {"middle_name"}
    </text>
    <text x={520} y={640} fontFamily="Arial" fontSize={12}>
      {"gender"}
    </text>
    <text x={520} y={660} fontFamily="Arial" fontSize={12}>
      {"status"}
    </text>
    <text x={520} y={680} fontFamily="Arial" fontSize={12}>
      {"availability_status"}
    </text>
    <text x={520} y={700} fontFamily="Arial" fontSize={12}>
      {"residence"}
    </text>
    <text x={520} y={720} fontFamily="Arial" fontSize={12}>
      {"national_id_number"}
    </text>
    <text x={520} y={740} fontFamily="Arial" fontSize={12}>
      {"national_id_card"}
    </text>
    <text x={520} y={760} fontFamily="Arial" fontSize={12}>
      <tspan fontWeight="bold">{"FK"}</tspan>
      {" created_by (user_FK)"}
    </text>
    <text x={520} y={780} fontFamily="Arial" fontSize={12}>
      {"created_at"}
    </text>
    <line
      x1={510}
      y1={350}
      x2={380}
      y2={340}
      stroke="#333"
      strokeWidth={1.5}
      markerEnd="url(#arrow)"
    />
    <text x={430} y={330} fontFamily="Arial" fontSize={10} fill="#333">
      {"1:1"}
    </text>
    <line
      x1={510}
      y1={400}
      x2={380}
      y2={670}
      stroke="#333"
      strokeWidth={1.5}
      markerEnd="url(#many)"
    />
    <text x={430} y={550} fontFamily="Arial" fontSize={10} fill="#333">
      {"1:N"}
    </text>
    <line
      x1={690}
      y1={350}
      x2={750}
      y2={160}
      stroke="#333"
      strokeWidth={1.5}
      markerEnd="url(#many)"
    />
    <text x={720} y={230} fontFamily="Arial" fontSize={10} fill="#333">
      {"1:N"}
    </text>
    <line
      x1={690}
      y1={400}
      x2={750}
      y2={520}
      stroke="#333"
      strokeWidth={1.5}
      markerEnd="url(#many)"
    />
    <text x={720} y={470} fontFamily="Arial" fontSize={10} fill="#333">
      {"1:N"}
    </text>
    <line
      x1={600}
      y1={480}
      x2={600}
      y2={510}
      stroke="#333"
      strokeWidth={1.5}
      markerEnd="url(#arrow)"
    />
    <text x={580} y={500} fontFamily="Arial" fontSize={10} fill="#333">
      {"1:1"}
    </text>
    <line
      x1={850}
      y1={420}
      x2={850}
      y2={450}
      stroke="#333"
      strokeWidth={1.5}
      markerEnd="url(#many)"
    />
    <text x={830} y={440} fontFamily="Arial" fontSize={10} fill="#333">
      {"1:N"}
    </text>
    <line
      x1={950}
      y1={160}
      x2={1000}
      y2={160}
      stroke="#333"
      strokeWidth={1.5}
      markerEnd="url(#many)"
    />
    <text x={970} y={145} fontFamily="Arial" fontSize={10} fill="#333">
      {"1:N"}
    </text>
  </svg>
);
export default DatabaseDiagram;
