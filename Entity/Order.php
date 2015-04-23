<?php

namespace Sulu\Bundle\Sales\OrderBundle\Entity;

class Order extends AbstractOrder
{
    /**
     * @var string
     */
    protected $sessionId;

    /**
     * @var OrderType
     */
    protected $type;

    /**
     * Set sessionId
     *
     * @param string $sessionId
     * @return Order1
     */
    public function setSessionId($sessionId)
    {
        $this->sessionId = $sessionId;

        return $this;
    }

    /**
     * Get sessionId
     *
     * @return string
     */
    public function getSessionId()
    {
        return $this->sessionId;
    }

    /**
     * Set type
     *
     * @param OrderType $type
     * @return Order
     */
    public function setType(OrderType $type)
    {
        $this->type = $type;

        return $this;
    }

    /**
     * Get type
     *
     * @return OrderType
     */
    public function getType()
    {
        return $this->type;
    }
}
