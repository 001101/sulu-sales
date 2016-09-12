<?php

namespace Sulu\Bundle\Sales\OrderBundle\Entity;

use Doctrine\ORM\NoResultException;
use Sulu\Bundle\ContactBundle\Entity\AccountInterface;
use Sulu\Component\Persistence\Repository\ORM\EntityRepository;
use Sulu\Component\Security\Authentication\UserInterface;

/**
 * Repository for Sales Order.
 */
class OrderRepository extends EntityRepository
{
    /**
     * @param int $id
     *
     * @return OrderInterface|null
     */
    public function findById($id)
    {
        try {
            $qb = $this->createQueryBuilder('o')
                ->andWhere('o.id = :orderId')
                ->setParameter('orderId', $id);

            return $qb->getQuery()->getSingleResult();
        } catch (NoResultException $exc) {
            return null;
        }
    }

    /**
     * @param int $id
     * @param bool $multipleResults
     *
     * @return null|OrderInterface
     */
    public function findOrderForItemWithId($id, $multipleResults = false)
    {
        try {
            $qb = $this->createQueryBuilder('o')
                ->join('o.items', 'items')
                ->where('items.id = :id')
                ->setParameter('id', $id);

            $query = $qb->getQuery();

            if (!$multipleResults) {
                return $query->getSingleResult();
            } else {
                return $query->getResult();
            }
        } catch (NoResultException $exc) {
            return null;
        }
    }

    /**
     * Returns all orders in the given locale.
     *
     * @param string $locale The locale of the order to load
     *
     * @return OrderInterface[]|null
     */
    public function findAllByLocale($locale)
    {
        try {
            return $this->getOrderQuery($locale)->getQuery()->getResult();
        } catch (NoResultException $exc) {
            return null;
        }
    }

    /**
     * Returns all orders and filters them.
     *
     * @param string $locale
     * @param array $filter
     *
     * @return OrderInterface[]|null
     */
    public function findByLocaleAndFilter($locale, array $filter)
    {
        try {
            $qb = $this->getOrderQuery($locale);

            foreach ($filter as $key => $value) {
                switch ($key) {
                    case 'status':
                        $qb->andWhere('status.id = :' . $key);
                        $qb->setParameter($key, $value);
                        break;
                }
            }

            $query = $qb->getQuery();

            return $query->getResult();
        } catch (NoResultException $ex) {
            return null;
        }
    }

    /**
     * Finds an order by id and locale.
     *
     * @param int $id
     * @param string $locale
     *
     * @return OrderInterface|null
     */
    public function findByIdAndLocale($id, $locale)
    {
        try {
            $qb = $this->getOrderQuery($locale);
            $qb->andWhere('o.id = :orderId');
            $qb->setParameter('orderId', $id);

            return $qb->getQuery()->getSingleResult();
        } catch (NoResultException $exc) {
            return null;
        }
    }

    /**
     * Finds all orders of a user made this month.
     *
     * @param string $locale
     * @param UserInterface $user
     *
     * @throws \Doctrine\ORM\NonUniqueResultException
     *
     * @return OrderInterface[]|null
     */
    public function findUserOrdersForCurrentMonth($locale, UserInterface $user)
    {
        try {
            $qb = $this->getOrderQuery($locale)
                ->andWhere('status.id >= :statusId')
                ->andWhere('o.changed >= :currentMonth')
                ->andWhere('o.creator = :user')
                ->setParameter('statusId', OrderStatus::STATUS_CONFIRMED)
                ->setParameter('currentMonth', date('Y-m-01 0:00:00'))
                ->setParameter('user', $user)
                ->orderBy('o.created', 'ASC');

            return $qb->getQuery()->getResult();
        } catch (NoResultException $exc) {
            return null;
        }
    }

    /**
     * Find all orders of an account with a specific status.
     *
     * @param string $locale
     * @param int $status
     * @param AccountInterface $account
     *
     * @return OrderInterface[]|null
     */
    public function findOrdersByStatusAndAccount($locale, $status, AccountInterface $account)
    {
        try {
            $qb = $this->getOrderQuery($locale)
                ->leftJoin('o.creator', 'creator')
                ->leftJoin('creator.contact', 'contact')
                ->leftJoin('contact.accountContacts', 'accountContact', 'WITH', 'accountContact.main = true')
                ->leftJoin('accountContact.account', 'account')
                ->andWhere('status.id = :statusId')
                ->andWhere('account = :account')
                ->setParameter('account', $account)
                ->setParameter('statusId', $status);

            return $qb->getQuery()->getResult();
        } catch (NoResultException $exc) {
            return null;
        }
    }

    /**
     * Finds orders by statusId and user.
     *
     * @param string $locale
     * @param int $statusId
     * @param UserInterface $user
     * @param int|null $limit
     *
     * @return array|null
     */
    public function findByStatusIdAndUser($locale, $statusId, UserInterface $user, $limit = null)
    {
        return $this->findByStatusIdsAndUser($locale, [$statusId], $user, $limit);
    }

    /**
     * Finds orders by statusIds and user.
     *
     * @param string $locale
     * @param array $statusIds
     * @param UserInterface $user
     * @param int|null $limit
     *
     * @return array|null
     */
    public function findByStatusIdsAndUser($locale, $statusIds, UserInterface $user, $limit = null)
    {
        try {
            $qb = $this->getOrderQuery($locale)
                ->andWhere('o.creator = :user')
                ->setParameter('user', $user)
                ->andWhere('status.id IN (:statusId)')
                ->setParameter('statusId', $statusIds)
                ->orderBy('o.created', 'DESC')
                ->setMaxResults($limit);

            return $qb->getQuery()->getResult();
        } catch (NoResultException $exc) {
            return null;
        }
    }

    /**
     * Returns query for orders.
     *
     * @param string $locale The locale to load
     *
     * @return \Doctrine\ORM\QueryBuilder
     */
    private function getOrderQuery($locale)
    {
        $qb = $this->createQueryBuilder('o')
            ->leftJoin('o.deliveryAddress', 'deliveryAddress')
            ->leftJoin('o.invoiceAddress', 'invoiceAddress')
            ->leftJoin('o.status', 'status')
            ->leftJoin('status.translations', 'statusTranslations', 'WITH', 'statusTranslations.locale = :locale')
            ->leftJoin('o.items', 'items')
            ->setParameter('locale', $locale);

        return $qb;
    }
}
