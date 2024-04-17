"use client";

import { Toaster, toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    TableCaption,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
    Table,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const required = ["requirement", "parsed_result", "query"];

export default function Home() {
    const [processing, setProcessing] = useState(false);
    const [processingVisualization, setProcessingVisualization] =
        useState(false);
    const [fetchingSchema, setFetchingSchema] = useState(false);
    const [dbSchema, setDbSchema] = useState<any>();
    const [queryResult, setQueryResult] = useState<any>();
    const [db, setDB] = useState("postgres");
    const [visualizationImageURL, setVisualizationImageURL] =
        useState<string>();

    const queryInputRef = useRef<HTMLInputElement>(null);
    const graphTypeInputRef = useRef<HTMLInputElement>(null);
    const graphDataInputRef = useRef<HTMLInputElement>(null);
    const graphRepresentationInputRef = useRef<HTMLInputElement>(null);

    const fetchPostgresDBSchema = async () => {
        setFetchingSchema(true);
        const res = await fetch(
            process.env.NEXT_PUBLIC_BACKEND_URL + "/db_schema"
        );

        const data = await res.json();
        setDbSchema(data["data"]);
        setFetchingSchema(false);
    };

    const fetchMongoDBSchema = async () => {
        setFetchingSchema(true);
        const res = await fetch(
            process.env.NEXT_PUBLIC_BACKEND_URL + "/mongo_schema"
        );

        const data = await res.json();
        setDbSchema(data["data"]);
        setFetchingSchema(false);
    };

    const runMonoQuery = async () => {
        setQueryResult(null);
        setProcessing(true);

        const requirement = queryInputRef.current?.value;
        if (!requirement) {
            setProcessing(false);
            return;
        }

        const route =
            process.env.NEXT_PUBLIC_BACKEND_URL +
            `/mongo_query?user_input=${requirement}`;

        try {
            const response = await fetch(route);
            // console.log(response);
            const data = await response.json();
            setQueryResult(data);
            console.log(data);
        } catch (err) {
            console.log(err);
        }

        setProcessing(false);
    };

    const runPostgresQuery = async () => {
        setQueryResult(null);
        setProcessing(true);

        const requirement = queryInputRef.current?.value;
        if (!requirement) {
            setProcessing(false);
            return;
        }

        const route =
            process.env.NEXT_PUBLIC_BACKEND_URL +
            `/query?user_input=${requirement}&additional_info=true`;

        try {
            const response = await fetch(route);
            const data = await response.json();
            setQueryResult(data);
            toast.info(
                "Update the query to with additional information for more precision"
            );
            console.log(data);
        } catch (err) {
            console.log(err);
        }

        setProcessing(false);
    };

    const runQuery = () => {
        if (db == "postgres") {
            runPostgresQuery();
        } else {
            runMonoQuery();
        }
    };

    const fetchVisualization = async () => {
        if (db == "postgres") {
            fetchVisualizationPostgres();
        } else {
            fetchVisualizationMongo();
        }
    };

    const fetchVisualizationMongo = async () => {
        setProcessingVisualization(true);

        const data = graphDataInputRef.current?.value;
        const type = graphTypeInputRef.current?.value;
        const representation = graphRepresentationInputRef.current?.value;

        if (!data || !type || !representation) {
            setProcessingVisualization(false);
            return;
        }

        const route =
            process.env.NEXT_PUBLIC_BACKEND_URL +
            `/mongo_visualization?user_input=${data}&chart_type=${type}&vis_requirement=${representation}`;

        try {
            const response = await fetch(route);
            const imageBlob = await response.blob();
            setVisualizationImageURL(URL.createObjectURL(imageBlob));
        } catch (err) {
            console.log(err);
        }

        setProcessingVisualization(false);
    };

    const fetchVisualizationPostgres = async () => {
        setProcessingVisualization(true);

        const data = graphDataInputRef.current?.value;
        const type = graphTypeInputRef.current?.value;
        const representation = graphRepresentationInputRef.current?.value;

        if (!data || !type || !representation) {
            setProcessingVisualization(false);
            return;
        }

        const route =
            process.env.NEXT_PUBLIC_BACKEND_URL +
            `/visualization?user_input=${data}&chart_type=${type}&vis_requirement=${representation}`;

        try {
            const response = await fetch(route);
            const imageBlob = await response.blob();
            setVisualizationImageURL(URL.createObjectURL(imageBlob));
        } catch (err) {
            console.log(err);
        }

        setProcessingVisualization(false);
    };

    const changeSelectedDB = async (checked: boolean) => {
        setQueryResult(null);
        if (checked) {
            setDB("mongo");
            fetchMongoDBSchema();
        } else {
            setDB("postgres");
            fetchPostgresDBSchema();
        }
    };

    useEffect(() => {
        fetchPostgresDBSchema();
    }, []);

    return (
        <main className="flex min-h-screen gap-10 p-32 justify-between">
            <div className="flex flex-col h-full gap-10 flex-1">
                <h1 className="font-extrabold text-6xl">NLI For DB</h1>
                <div className="flex items-center space-x-2">
                    <Label htmlFor="airplane-mode">PostgreSQL</Label>
                    <Switch
                        id="airplane-mode"
                        onCheckedChange={changeSelectedDB}
                    />
                    <Label htmlFor="airplane-mode">Mongo DB</Label>
                </div>
                <div className="flex flex-col">
                    <h1 className="font-bold">Database Schema</h1>
                    <ResDesp data={dbSchema} />
                </div>
                <div className="flex gap-4">
                    <Input
                        type="text"
                        placeholder="Input your query"
                        className="w-96"
                        ref={queryInputRef}
                    />
                    <Button onClick={runQuery}>
                        {processing ? (
                            <>
                                <Loader2 className="animate-spin mr-2" />
                                Processing Results...
                            </>
                        ) : (
                            "Run Query"
                        )}
                    </Button>
                </div>
                {queryResult && db == "postgres" && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Query Result</CardTitle>
                            <CardDescription>
                                Detailed description of the query and metadata
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {required.map((value, key) => (
                                <div className="flex gap-4" key={key}>
                                    <h3 className="font-semibold">{value}: </h3>
                                    <p>{queryResult[value]}</p>
                                </div>
                            ))}
                            <Table className="mt-10">
                                <TableCaption>Results</TableCaption>
                                <TableHeader>
                                    <TableRow>
                                        {queryResult["col_names"] &&
                                            queryResult["col_names"].map(
                                                (
                                                    value: string,
                                                    key: number
                                                ) => (
                                                    <TableHead key={key}>
                                                        {value}
                                                    </TableHead>
                                                )
                                            )}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {queryResult["result"].map(
                                        (row: any, key: number) => (
                                            <TableRow key={key}>
                                                {row.map(
                                                    (
                                                        value: any,
                                                        key: number
                                                    ) => (
                                                        <TableCell
                                                            key={key}
                                                            className="font-medium"
                                                        >
                                                            {value}
                                                        </TableCell>
                                                    )
                                                )}
                                            </TableRow>
                                        )
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                        <CardFooter>
                            <div className="flex justify-center w-full text-sm">
                                Update the requirement if you need more specific
                                results
                            </div>
                        </CardFooter>
                    </Card>
                )}
                {queryResult && db == "mongo" && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Query Result</CardTitle>
                            <CardDescription>
                                Result for the query in MongoDB
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-4">
                                <h3 className="font-semibold">Data: </h3>
                                <p>{queryResult["data"]}</p>
                            </div>
                            {queryResult["documents"] &&
                                queryResult["documents"].length > 0 && (
                                    <Table className="mt-10">
                                        <TableCaption>Results</TableCaption>
                                        <TableHeader>
                                            <TableRow>
                                                {Object.keys(
                                                    queryResult["documents"][0]
                                                ).map(
                                                    (
                                                        value: string,
                                                        key: number
                                                    ) => (
                                                        <TableHead key={key}>
                                                            {value}
                                                        </TableHead>
                                                    )
                                                )}
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {queryResult["documents"].map(
                                                (row: any, key: number) => (
                                                    <TableRow key={key}>
                                                        {Object.keys(row).map(
                                                            (
                                                                value: any,
                                                                key: number
                                                            ) => (
                                                                <TableCell
                                                                    key={key}
                                                                    className="font-medium"
                                                                >
                                                                    {row[value]}
                                                                </TableCell>
                                                            )
                                                        )}
                                                    </TableRow>
                                                )
                                            )}
                                        </TableBody>
                                    </Table>
                                )}
                        </CardContent>
                        <CardFooter>
                            <div className="flex justify-center w-full text-sm">
                                Update the requirement if you need more specific
                                results
                            </div>
                        </CardFooter>
                    </Card>
                )}
            </div>
            <div className="flex-1">
                <h1 className="font-extrabold text-6xl">Visualization AID</h1>
                <div className="mt-10 flex flex-col gap-4">
                    <Input
                        type="text"
                        placeholder="What is the required data?"
                        ref={graphDataInputRef}
                    />
                    <Input
                        type="text"
                        placeholder="What is the type of graph needed?"
                        ref={graphTypeInputRef}
                    />
                    <Input
                        type="text"
                        placeholder="What does the graph represent?"
                        ref={graphRepresentationInputRef}
                    />
                    <Button onClick={fetchVisualization}>
                        {processingVisualization ? (
                            <>
                                <Loader2 className="animate-spin mr-2" />
                                Fetching Graph...
                            </>
                        ) : (
                            "Fetch Graph"
                        )}
                    </Button>
                    <img src={visualizationImageURL}></img>
                </div>
            </div>
            <Toaster richColors position="bottom-center" />
        </main>
    );
}

const ResDesp = ({ data }: { data: object }) => {
    if (!data || Object.keys(data).length === 0) {
        return <div>No data available</div>;
    }

    const entries = Object.entries(data);

    return (
        <div>
            {entries.map(([key, value]) => (
                <div key={key}>
                    <strong>{key}: </strong>
                    {typeof value === "object" ? (
                        <ResDesp data={value} />
                    ) : (
                        <span>{value}</span>
                    )}
                </div>
            ))}
        </div>
    );
};
