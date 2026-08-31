
// ============================================
// SUPABASE CONFIGURATION
// ============================================

const SUPABASE_URL =
    "https://epmqjfftonefqyvpucvo.supabase.co";


// Publishable Key
const SUPABASE_KEY =
    "sb_publishable_t55Blrc8O-PjtsO2ZFiyWA_FNeaod43";


// ============================================
// CREATE SUPABASE CLIENT
// ============================================

const {
    createClient
} = supabase;

const db =
    createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// ============================================
// MACHINE CODE
// ============================================

const MACHINE_CODE =
    "SANITARY-60";


// ============================================
// REALTIME STATUS
// ============================================

let realtimeChannel = null;


// ============================================
// UPDATE REALTIME STATUS ON SCREEN
// ============================================

function updateRealtimeStatus(
    connected,
    message
) {

    const statusElement =
        document.getElementById(
            "machineStatus"
        );


    if (!statusElement) {
        return;
    }


    if (connected) {

        statusElement.textContent =
            "● REALTIME ONLINE";

        statusElement.className =
            "status online";

    }

    else {

        statusElement.textContent =
            "● REALTIME OFFLINE";

        statusElement.className =
            "status offline";
    }


    console.log(
        "Realtime:",
        message
    );
}


// ============================================
// LOAD MACHINE
// ============================================

async function loadMachine() {

    const {
        data,
        error
    } = await db

        .from("machines")

        .select("*")

        .eq(
            "machine_code",
            MACHINE_CODE
        )

        .single();


    if (error) {

        console.error(
            "Machine error:",
            error
        );

        updateRealtimeStatus(
            false,
            "Cannot load machine"
        );

        return;
    }


    // ========================================
    // UPDATE MACHINE INFORMATION
    // ========================================

    const machineCodeElement =
        document.getElementById(
            "machineCode"
        );

    if (machineCodeElement) {

        machineCodeElement.textContent =
            data.machine_code;
    }


    const locationElement =
        document.getElementById(
            "location"
        );

    if (locationElement) {

        locationElement.textContent =
            data.location;
    }


    // ========================================
    // UPDATE STOCK
    // ========================================

    const stockElement =
        document.getElementById(
            "stock"
        );

    if (stockElement) {

        stockElement.textContent =
            data.stock;
    }


    // ========================================
    // UPDATE REVENUE
    // ========================================

    const revenueElement =
        document.getElementById(
            "revenue"
        );

    if (revenueElement) {

        revenueElement.textContent =
            "฿" +
            Number(
                data.total_revenue
            ).toLocaleString(
                "th-TH"
            );
    }


    // ========================================
    // UPDATE DISPENSED
    // ========================================

    const dispensedElement =
        document.getElementById(
            "dispensed"
        );

    if (dispensedElement) {

        dispensedElement.textContent =
            data.total_dispensed;
    }


    // ========================================
    // MACHINE STATUS
    // ========================================

    const statusElement =
        document.getElementById(
            "machineStatus"
        );


    if (statusElement) {

        if (
            data.status === "ONLINE"
        ) {

            statusElement.textContent =
                "● ONLINE";

            statusElement.className =
                "status online";

        }

        else {

            statusElement.textContent =
                "● " +
                data.status;

            statusElement.className =
                "status offline";
        }
    }


    console.log(
        "Machine updated:",
        data
    );
}


// ============================================
// LOAD TRANSACTIONS
// ============================================

async function loadTransactions() {

    const {
        data,
        error
    } = await db

        .from("transactions")

        .select("*")

        .order(
            "created_at",
            {
                ascending: false
            }
        )

        .limit(10);


    if (error) {

        console.error(
            "Transaction error:",
            error
        );

        return;
    }


    const table =
        document.getElementById(
            "transactionTable"
        );


    if (!table) {
        return;
    }


    table.innerHTML = "";


    // ========================================
    // NO TRANSACTIONS
    // ========================================

    if (
        !data ||
        data.length === 0
    ) {

        table.innerHTML = `
            <tr>
                <td colspan="4">
                    No transactions yet
                </td>
            </tr>
        `;

        return;
    }


    // ========================================
    // CREATE TABLE ROWS
    // ========================================

    data.forEach(
        transaction => {

            const row =
                document.createElement(
                    "tr"
                );


            const date =
                new Date(
                    transaction.created_at
                );


            row.innerHTML = `

                <td>
                    ${date.toLocaleString(
                        "th-TH"
                    )}
                </td>

                <td>
                    ฿${Number(
                        transaction.amount
                    ).toLocaleString(
                        "th-TH"
                    )}
                </td>

                <td>
                    ${transaction.product_quantity}
                    pack
                </td>

                <td class="${
                    transaction.dispense_status
                    === "SUCCESS"
                    ? "success"
                    : "error"
                }">

                    ${
                        transaction.dispense_status
                    }

                </td>

            `;


            table.appendChild(
                row
            );
        }
    );


    // ========================================
    // LAST TRANSACTION
    // ========================================

    const latest =
        data[0];


    const latestDate =
        new Date(
            latest.created_at
        );


    const lastTransactionElement =
        document.getElementById(
            "lastTransaction"
        );


    if (
        lastTransactionElement
    ) {

        lastTransactionElement.innerHTML = `

            <strong>
                ฿${Number(
                    latest.amount
                ).toLocaleString(
                    "th-TH"
                )}
            </strong>

            &nbsp; →

            ${latest.product_quantity}
            pack

            &nbsp; →

            <span class="success">
                ${latest.dispense_status}
            </span>

            <br>

            <small>
                ${latestDate.toLocaleString(
                    "th-TH"
                )}
            </small>

        `;
    }
}


// ============================================
// START REALTIME
// ============================================

function startRealtime() {

    console.log(
        "Starting Supabase Realtime..."
    );


    // ----------------------------------------
    // Remove previous channel
    // ----------------------------------------

    if (
        realtimeChannel
    ) {

        db.removeChannel(
            realtimeChannel
        );
    }


    // ----------------------------------------
    // Create Realtime Channel
    // ----------------------------------------

    realtimeChannel =
        db.channel(
            "smart-sanitary-dashboard"
        );


    // ========================================
    // MACHINES
    // ========================================

    realtimeChannel.on(
        "postgres_changes",
        {
            event: "UPDATE",
            schema: "public",
            table: "machines",
            filter:
                "machine_code=eq." +
                MACHINE_CODE
        },

        async payload => {

            console.log(
                "Realtime MACHINES UPDATE:",
                payload
            );


            // โหลดข้อมูล machine ใหม่
            await loadMachine();

        }
    );


    // ========================================
    // TRANSACTIONS
    // ========================================

    realtimeChannel.on(
        "postgres_changes",
        {
            event: "INSERT",
            schema: "public",
            table: "transactions"
        },

        async payload => {

            console.log(
                "Realtime TRANSACTION INSERT:",
                payload
            );


            // โหลดรายการใหม่
            await loadTransactions();


            // โหลด machine ใหม่ด้วย
            // เผื่อ stock/revenue ถูก update
            await loadMachine();

        }
    );


    // ========================================
    // MACHINE EVENTS
    // ========================================

    realtimeChannel.on(
        "postgres_changes",
        {
            event: "INSERT",
            schema: "public",
            table: "machine_events"
        },

        payload => {

            console.log(
                "Realtime MACHINE EVENT:",
                payload
            );

        }
    );


    // ========================================
    // SUBSCRIBE
    // ========================================

    realtimeChannel.subscribe(
        (
            status,
            error
        ) => {

            console.log(
                "Realtime status:",
                status
            );


            // --------------------------------
            // CONNECTED
            // --------------------------------

            if (
                status === "SUBSCRIBED"
            ) {

                updateRealtimeStatus(
                    true,
                    "Connected"
                );

                console.log(
                    "Supabase Realtime CONNECTED"
                );
            }


            // --------------------------------
            // ERROR
            // --------------------------------

            else if (
                status === "CHANNEL_ERROR"
            ) {

                updateRealtimeStatus(
                    false,
                    "Channel error"
                );


                console.error(
                    "Realtime CHANNEL_ERROR:",
                    error
                );
            }


            // --------------------------------
            // TIMEOUT
            // --------------------------------

            else if (
                status === "TIMED_OUT"
            ) {

                updateRealtimeStatus(
                    false,
                    "Connection timeout"
                );


                console.error(
                    "Realtime TIMED_OUT:",
                    error
                );
            }


            // --------------------------------
            // CLOSED
            // --------------------------------

            else if (
                status === "CLOSED"
            ) {

                updateRealtimeStatus(
                    false,
                    "Channel closed"
                );
            }

        }
    );
}


// ============================================
// START DASHBOARD
// ============================================

async function startDashboard() {

    console.log(
        "Starting Smart Sanitary Dashboard..."
    );


    // ----------------------------------------
    // Initial data
    // ----------------------------------------

    await loadMachine();

    await loadTransactions();


    // ----------------------------------------
    // Start Realtime
    // ----------------------------------------

    startRealtime();


    console.log(
        "Dashboard loaded."
    );

}


// ============================================
// RUN
// ============================================

startDashboard();

