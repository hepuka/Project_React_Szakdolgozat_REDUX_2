/* =========================================================
   IRÁNYÍTÓPULT - RENDEZETLEN SZÁMLÁK
   ========================================================= */

import { Link } from "react-router-dom";

import Icon from "../../../components/Icon";

import { formatCurrency } from "../../../services/financeCalculations";

const PendingExpensesPanel = ({ pendingExpenseList }) => {
  return (
    <article className="admin__panel admin__panel--expenses">
      <div className="admin__panelHeader">
        <div>
          <span className="admin__panelEyebrow">Figyelmeztetés</span>

          <h2>Rendezetlen számlák</h2>
        </div>

        <Link to="/expenses" className="admin__panelLink">
          Kezelés
        </Link>
      </div>

      {pendingExpenseList.length === 0 ? (
        <div className="admin__emptySmall">
          <Icon name="check" size={22} />

          <p>Nincs rendezetlen számla ebben a hónapban.</p>
        </div>
      ) : (
        <div className="admin__expenseList">
          {pendingExpenseList.map((expense) => (
            <Link
              key={expense.id}
              to="/expenses"
              className="admin__expenseRow"
            >
              <div className="admin__expenseWarning">
                <Icon name="alert" size={15} />
              </div>

              <div className="admin__expenseInfo">
                <strong>{expense.description}</strong>

                <span>
                  {expense.category}

                  {expense.dueDate && ` • Határidő: ${expense.dueDate}`}
                </span>
              </div>

              <strong className="admin__expenseAmount">
                − {formatCurrency(expense.amount)} Ft
              </strong>
            </Link>
          ))}
        </div>
      )}
    </article>
  );
};

export default PendingExpensesPanel;
