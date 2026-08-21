// ============================================
// SUPABASE CONFIGURATION
// ============================================

// ใส่ Project URL ของคุณที่นี่
const SUPABASE_URL =
    "epmqjfftonefqyvpucvo.supabase.co";


// ใส่ Publishable Key ของคุณที่นี่
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

        return;
    }


    // ========================================
    // UPDATE DASHBOARD
    // ========================================

    document
        .getElementById("machineCode")
        .textContent =
        data.machine_code;


    document
        .getElementById("location")
        .textContent =
        data.location;


    document
        .getElementById("stock")
        .textContent =
        data.stock;


    document
        .getElementById("revenue")
        .textContent =
        "฿" +
        Number(
            data.total_revenue
        ).toLocaleString();


    document
        .getElementById("dispensed")
        .textContent =
        data.total_dispensed;


    // ========================================
    // MACHINE STATUS
    // ========================================

    const statusElement =
        document.getElementById(
            "machineStatus"
        );


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
                    ฿${transaction.amount}
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


            table.appendChild(row);

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


    document
        .getElementById(
            "lastTransaction"
        )
        .innerHTML = `

            <strong>
                ฿${latest.amount}
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


// ============================================
// START DASHBOARD
// ============================================

async function startDashboard() {

    console.log(
        "Starting Smart Sanitary Dashboard..."
    );


    await loadMachine();

    await loadTransactions();


    console.log(
        "Dashboard loaded."
    );

}


// ============================================
// RUN
// ============================================

startDashboard();